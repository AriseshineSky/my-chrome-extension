// src/content/runtime/listener.ts
import { isTaskRunning, startTask } from "./task";
import { goToOrderHistoryPage } from "../order";

export function initMessageListener() {
  chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (message.type !== "fetchOrders") return;

    if (isTaskRunning()) {
      sendResponse({ status: "already_running" });
      return;
    }

    startTask();
    goToOrderHistoryPage();
    sendResponse({ status: "started" });
  });
}

