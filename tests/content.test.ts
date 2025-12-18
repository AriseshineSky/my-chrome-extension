import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("../services/api", () => ({
  fetchInfo: vi.fn(),
  sendClickLog: vi.fn(),
}));

vi.mock("../content/order", () => ({
  getOrders: vi.fn(),
  goToOrderHistoryPage: vi.fn(),
}));

import { fetchInfo, sendClickLog } from "../services/api";
import { getOrders, goToOrderHistoryPage } from "../content/order";
import {
  initContentScript,
  runOnce,
  startTask,
  clearTask,
  TASK_KEY,
  TASK_EXPIRES_KEY,
} from "../content/content";

function mockChrome() {
  const listeners: any[] = [];
  (globalThis as any).chrome = {
    runtime: {
      onMessage: {
        addListener: (fn: any) => listeners.push(fn),
      },
      sendMessage: vi.fn(),
    },
  };
  return { listeners };
}

describe("content.ts task flow", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    sessionStorage.clear();
    localStorage.clear();

    // jsdom 默认 readyState 可能是 "loading"
    Object.defineProperty(document, "readyState", {
      value: "complete",
      configurable: true,
    });

    // 模拟 Amazon UK domain
    Object.defineProperty(window, "location", {
      value: new URL("https://www.amazon.co.uk/anything"),
      writable: true,
    });

    // 模拟登录 cookie
    Object.defineProperty(document, "cookie", {
      value: "x-acbuk=1;",
      writable: true,
    });
  });

  it("should ignore click when already running", async () => {
    const { listeners } = mockChrome();

    // 先初始化（注册 listener）
    initContentScript();

    // 强制设置 running
    sessionStorage.setItem(TASK_KEY, "running");
    sessionStorage.setItem(TASK_EXPIRES_KEY, String(Date.now() + 60_000));

    const sendResponse = vi.fn();
    listeners[0]({ type: "fetchOrders" }, null, sendResponse);

    expect(sendResponse).toHaveBeenCalledWith({ status: "already_running" });
    expect(goToOrderHistoryPage).not.toHaveBeenCalled();
  });

  it("should start task and redirect on click", async () => {
    const { listeners } = mockChrome();
    initContentScript();

    const sendResponse = vi.fn();
    listeners[0]({ type: "fetchOrders" }, null, sendResponse);

    expect(sendResponse).toHaveBeenCalledWith({ status: "started" });
    expect(sessionStorage.getItem(TASK_KEY)).toBe("running");
    expect(goToOrderHistoryPage).toHaveBeenCalledTimes(1);
  });

  it("runOnce should clear task when not logged in", async () => {
    mockChrome();
    // 改成没登录
    Object.defineProperty(document, "cookie", {
      value: "",
      writable: true,
    });

    startTask();
    await runOnce();

    expect(sessionStorage.getItem(TASK_KEY)).toBeNull();
  });

  it("runOnce should call getOrders and clear when done", async () => {
    mockChrome();

    (fetchInfo as any).mockResolvedValue(
      new DOMParser().parseFromString(
        `<span id="NAME_SUBTITLE">Joyce</span><span id="EMAIL_SUBTITLE">a@b.com</span>`,
        "text/html",
      ),
    );
    (getOrders as any).mockResolvedValue(true);

    startTask();
    await runOnce();

    expect(sendClickLog).toHaveBeenCalledWith("a@b.com");
    expect(getOrders).toHaveBeenCalledTimes(1);
    expect(sessionStorage.getItem(TASK_KEY)).toBeNull();
  });
});

