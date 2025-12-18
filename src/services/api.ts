const BASE_URL = "https://fulfill.everymarket.com/api/v2/amazon_orders";
const API_TOKEN = "your_secret_token_here";
type ApiResult<T> =
  | { ok: true; data: T }
  | { ok: false; status?: number; error: string };

export async function fetchInfo(url: string): Promise<Document> {
  const response = await fetch(url, { credentials: "include" });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${url}`);
  }

  const htmlText = await response.text();
  return new DOMParser().parseFromString(htmlText, "text/html");
}

export function sleep(ms) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

const headers = new Headers({ "Content-Type": "application/json" });
async function retryFetch<T>(
  url: string,
  options: RequestInit,
  retries = 3,
  baseDelay = 1000,
): Promise<ApiResult<T>> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const resp = await fetch(url, options);

      if (resp.ok) {
        return { ok: true, data: await resp.json() };
      }

      if (resp.status >= 400 && resp.status < 500) {
        // 客户端错误：不重试
        return {
          ok: false,
          status: resp.status,
          error: `HTTP ${resp.status}`,
        };
      }
    } catch (err) {
      console.warn("Network error:", err);
    }

    if (attempt < retries) {
      await sleep(baseDelay * attempt);
    }
  }

  return { ok: false, error: "retry_exhausted" };
}

export async function post(orders: any[]) {
  const result = await retryFetch(
    `${BASE_URL}/batch_create?token=${API_TOKEN}`,
    {
      method: "POST",
      headers,
      body: JSON.stringify({ amazon_orders: orders }),
    },
  );

  await sendLog({
    source: "amazon-order",
    level: result.ok ? "info" : "error",
    message: result.ok
      ? `Synced ${orders.length} orders`
      : `Sync failed`,
    metadata: {
      order_count: orders.length,
      result,
    },
  });

  return result.ok;
}

const LOG_ENDPOINT = "https://logging.everymarket.com/api/v1/logs";

export async function sendLog(log: {
  source: string;
  level: "info" | "warn" | "error";
  message: string;
  metadata?: Record<string, any>;
}) {
  try {
    await fetch(LOG_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Log-Source": "amazon-plugin", // 👈 保留来源标识
      },
      body: JSON.stringify({
        ...log,
        logged_at: new Date().toISOString(),
      }),
    });
  } catch {
    // ❗日志失败永远不能影响主流程
  }
}

export async function sendClickLog(email?: string) {
  if (!email) return;

  await retryFetch(
    `${BASE_URL.replace("/amazon_orders", "")}/plugin_click_logs?token=${API_TOKEN}`,
    {
      method: "POST",
      headers,
      body: JSON.stringify({ email }),
    },
  );
}

