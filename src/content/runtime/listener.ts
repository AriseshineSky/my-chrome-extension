// src/content/runtime/listener.ts
import { isTaskRunning, startTask } from "./task";

function getFullUrl(relativePath: string) {
	const fullUrl = new URL(relativePath, window.location.origin);
	return fullUrl.href;
}

export function goToOrderHistoryPage() {
	const orderHistoryPage = "/your-orders/orders"
	const fullUrl = getFullUrl(orderHistoryPage);
	console.log("Go to order history:", fullUrl);
	window.location.href = fullUrl;
}

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

