const LOG_ENDPOINT = "https://logging.everymarket.com/api/v1/logs";
const LOG_API_TOKEN = "7dfbd1c8a4e2453d9b2b569f37ce8b1c3c09e89157b7268cc60b6a4e35a68c51";

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


chrome.runtime.onMessage.addListener(async (msg, sender, sendResponse) => {
  if (msg.type === 'SEND_LOG') {
    try {
      const res = await fetch(LOG_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Log-Source': 'frontend',
          'Authorization': `Bearer ${LOG_API_TOKEN}`,
        },
        body: JSON.stringify({
          ...msg.log,
          logged_at: new Date().toISOString()
        }),
      });
      sendResponse({ ok: res.ok });
    } catch (err) {
      sendResponse({ ok: false, error: (err as Error).message });
    }
    return true; // keep async
  }
});

export async function fetchInfo(url: string): Promise<Document> {
  const response = await fetch(url, { credentials: "include" });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${url}`);
  }

  const htmlText = await response.text();
  return new DOMParser().parseFromString(htmlText, "text/html");
}

export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
