function handleGetOrders(sendResponse: (response?: any) => void): void {
	chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
		if (tabs.length === 0) {
			console.error("No active tab found.");
			return;
		}
		const tabId = tabs[0].id;
		if (tabId) {
			sendMessageToContentScript(tabId, { type: "fetchOrders" }, sendResponse);
		}
	});
}

function sendMessageToContentScript(
  tabId: number,
  message: any,
  sendResponse?: (response?: any) => void,
): void {
	chrome.tabs.sendMessage(tabId, message, (response) => {
		if (sendResponse) {
			sendResponse(response);
		}
	});
}

function handleUpdateButton(sendResponse: (response?: any) => void): void {
  sendResponse?.({ success: true });
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
	switch (message.type) {
		case "getOrders":
			handleGetOrders(sendResponse);
			break;
		case "updateButton":
			handleUpdateButton(sendResponse);
			break;
		default:
			console.log("Unhandled message type:", message.type);
	}

	return true;
});

chrome.runtime.onInstalled.addListener(() => {
	console.log("Extension installed, background active.");
});

