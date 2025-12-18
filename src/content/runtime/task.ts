// src/content/runtime/task.ts
const RUNNING = "running";

export const TASK_KEY = "amazon_order_task";
export const TASK_EXPIRES_KEY = "amazon_order_task_expires";
export const TASK_TTL = 10 * 60 * 1000;

export function isTaskRunning(): boolean {
  const expiresAt = Number(sessionStorage.getItem(TASK_EXPIRES_KEY) || 0);
  if (Date.now() > expiresAt) {
    clearTask();
    return false;
  }
  return sessionStorage.getItem(TASK_KEY) === RUNNING;
}

export function startTask() {
  sessionStorage.setItem(TASK_KEY, RUNNING);
  refreshTaskTTL();
}

export function refreshTaskTTL() {
  sessionStorage.setItem(
    TASK_EXPIRES_KEY,
    String(Date.now() + TASK_TTL),
  );
}

export function clearTask() {
  sessionStorage.removeItem(TASK_KEY);
  sessionStorage.removeItem(TASK_EXPIRES_KEY);
  chrome.runtime.sendMessage({
    type: "updateButton",
    data: { active: false },
  });
}

