function handleGetOrders(sendResponse) {
	chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
		const tabId = tabs[0].id;
		if (tabId) {
			sendMessageToContentScript(tabId, { type: "fetchOrders" }, sendResponse);
		}
	});
}

function sendMessageToContentScript(tabId, message, sendResponse) {
	chrome.tabs.sendMessage(tabId, message, (response) => {
		sendResponse(response);
	});
}

function handleUpdateButton(sendResponse) {
	sendResponse({ active: true });
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
