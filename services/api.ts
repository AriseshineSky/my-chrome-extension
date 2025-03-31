export async function fetchInfo(url: string): Promise<Document> {
	try {
		const response = await fetch(url, {
			credentials: "include",
		});

		if (!response.ok)
			throw new Error(`failed to fetch: ${url}, ${response.status}`);

		const htmlText = await response.text();
		const parser = new DOMParser();
		return parser.parseFromString(htmlText, "text/html");
	} catch (error) {
		console.log("fetch info error:", error);
		throw error;
	}
}

export function sleep(ms) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

const headers = new Headers({ "Content-Type": "application/json" });

async function retryFetch(url: string, options: RequestInit, retries = 5) {
	for (let i = retries; i > 0; i--) {
		try {
			console.log(`API request (${retries - i + 1}/${retries}) to: ${url}`);
			const resp = await fetch(url, options);

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
	return response !== null;
}
