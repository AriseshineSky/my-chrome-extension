const BASE_URL = "https://fulfill.everymarket.com/api/v2/amazon_orders";
const API_TOKEN = "your_secret_token_here";
export async function fetchInfo(url: string): Promise<Document | null> {
	try {
		const response = await fetch(url, { credentials: "include" });

		if (!response.ok) throw new Error(`HTTP ${response.status}: ${url}`);

		const htmlText = await response.text();
		const parser = new DOMParser();
		return parser.parseFromString(htmlText, "text/html");
	} catch (error) {
		console.error("fetch info error:", error);
		return null;
	}
}

export function sleep(ms) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

const headers = new Headers({ "Content-Type": "application/json" });

async function retryFetch(url: string, options: RequestInit, retries = 5, delay = 2000) {
	for (let i = retries; i > 0; i--) {
		try {
			console.log(`API request (${retries - i + 1}/${retries}) to: ${url}`);
			const resp = await fetch(url, options);

			if (resp.status === 404) {
				console.error(`Received 404. Not retrying. URL: ${url}`);
				return null;
			}

			if (resp.ok) {
				const respJson = await resp.json();
				console.log("Response received:", respJson);
				return respJson;
			}

			console.warn(
				`Request failed (HTTP ${resp.status}). Retries left: ${i - 1}`,
			);
		} catch (error) {
			console.error("Fetch error:", error);
		}

		if (i > 1) {
			console.log("Retrying after 2s...");
			await sleep(2000);
		}
	}

	console.error("Request failed after all retries:", url);
	return null;
}

export async function post(orders: any[]) {
	const url = "https://fulfill.everymarket.com/api/v2/amazon_orders/batch_create?token=your_secret_token_here";
	const options: RequestInit = {
		method: "POST",
		headers: headers,
		body: JSON.stringify({ amazon_orders: orders }),
	};

	const response = await retryFetch(url, options);
	await sendLog({
		source: "amazon-order",
		level: response ? 'info' : 'error',
		message: response
			? `Synced ${orders.length} orders successfully.`
			: `Failed to sync ${orders.length} orders.`,
		metadata: {
			endpoint: "batch_create",
			order_count: orders.length,
			request_body: orders,
		},
	});
	return response !== null;
}

export async function put(order: Record<string, any>) {
	const url = `https://fulfill.everymarket.com/api/v2/amazon_orders/${order.buy_order_number}?token=your_secret_token_here`;
	const options: RequestInit = {
		method: "PUT",
		headers: headers,
		body: JSON.stringify({ amazon_order: order }),
	};

	const response = await retryFetch(url, options);
	await sendLog({
		source: "amazon-order",
		level: response ? 'info' : 'error',
		message: response
			? `Updated order ${order.buy_order_number} successfully.`
			: `Failed to update order ${order.buy_order_number}.`,
		metadata: {
			endpoint: "update",
			order_id: order.buy_order_number,
			request_body: order,
		},
	});
	return response !== null;
}

async function sendLog(log: {
	source: string;
	level: 'info' | 'warn' | 'error';
	message: string;
	metadata?: Record<string, any>;
}) {
	try {
		await fetch('https://logging.everymarket.com/api/v1/logs', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'Authorization': 'Bearer 7dfbd1c8a4e2453d9b2b569f37ce8b1c3c09e89157b7268cc60b6a4e35a68c51',
				"X-Log-Source": "frontend",
			},
			body: JSON.stringify({ ...log, logged_at: new Date().toISOString() })
		})
	} catch (e) {
		console.warn('Logging failed', e);
	}
}
