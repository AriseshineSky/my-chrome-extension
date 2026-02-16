// src/content/runtime/run-once.ts
import { sendClickLog } from "../../services/api";
import { syncOrders } from "../../order";
import { isTaskRunning, refreshTaskTTL, clearTask } from "./task";
import { getCurrentAmazonCountry, isLogged } from "./env";
import { loadUser } from "./user";

const SOURCES = {
	"us": "AMZ_US",
	"uk": "AMZ_UK",
	"de": "AMZ_DE",
	"mx": "AMZ_MX"
}

export function ensureOrdersReady(timeout = 30000): Promise<void> {
  return new Promise((resolve, reject) => {
    const start = Date.now();

    const check = () => {
      // 1️⃣ 订单号（最终一定会出现）
      const hasOrderNumber =
        document.body.innerText.match(/\b\d{3}-\d{7}-\d{7}\b/);
			console.log(hasOrderNumber)

      // 2️⃣ 订单详情链接（US / UK / Business 通用）
      const orderDetailLinks =
        document.querySelectorAll(
          'a[href*="order-details"], a[href*="your-account"]'
        ).length > 0;

			console.log(orderDetailLinks)

      // 3️⃣ 商品标题链接（不是 skeleton）
      const productLinks =
        document.querySelectorAll(
          'a[href*="/dp/"], a[href*="/gp/product/"]'
        ).length > 0;

			console.log(productLinks)
      if (hasOrderNumber && (orderDetailLinks || productLinks)) {
        resolve();
        return;
      }

      if (Date.now() - start > timeout) {
        reject(
          new Error(
            "Amazon orders page did not hydrate order data in time",
          ),
        );
        return;
      }

      setTimeout(check, 500);
    };

    check();
  });
}

export async function runOnce() {
  if (!isTaskRunning()) return;

  await ensureOrdersReady();
  refreshTaskTTL();

  const country = getCurrentAmazonCountry();
  if (!country || !isLogged(country)) {
    clearTask();
    return;
  }

  const user = await loadUser();
  if (!user) {
    clearTask();
    return;
  }
	if (country in SOURCES) {
		user.source = SOURCES[country as keyof typeof SOURCES];
	} else {
		user.source = 'AMZ_US'; // 默认值
	}

	console.log(user)
  sendClickLog(user.email);

  try {
    const isDone = await syncOrders(user);
    if (isDone) clearTask();
    else refreshTaskTTL();
  } catch (err) {
    console.error("Order fetch failed:", err);
    clearTask();
  }
}

