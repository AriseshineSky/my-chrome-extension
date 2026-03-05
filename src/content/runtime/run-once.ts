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
	"mx": "AMZ_MX",
	"ca": "AMZ_CA"
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export async function ensureOrdersReady(timeout = 90000): Promise<void> {
  return new Promise((resolve, reject) => {
    const start = Date.now();
    let firstCardsSeenAt: number | null = null;

    const check = async () => {
      // 1️⃣ Order number text
      const hasOrderNumber =
        document.body.innerText.match(/\b\d{3}-\d{7}-\d{7}\b/);

      // 2️⃣ Order detail links
      const orderDetailLinks =
        document.querySelectorAll(
          'a[href*="order-details"], a[href*="your-account"]'
        ).length > 0;

      // 3️⃣ Product links
      const productLinks =
        document.querySelectorAll(
          'a[href*="/dp/"], a[href*="/gp/product/"]'
        ).length > 0;

      const cards = document.querySelectorAll("div.order-card, div#orderCard");
      const hasOrderCards = cards.length > 0;
      const hasSkeletonCards =
        hasOrderCards && Array.from(cards).some(card => card.querySelector(".skeleton"));

      if (hasOrderCards && firstCardsSeenAt === null) {
        firstCardsSeenAt = Date.now();
      }

      const cardsStableForMs =
        firstCardsSeenAt === null ? 0 : Date.now() - firstCardsSeenAt;
      const fallbackReady = hasOrderCards && cardsStableForMs > 8000;

      if (
        hasOrderCards && (
          hasOrderNumber ||
          orderDetailLinks ||
          productLinks ||
          !hasSkeletonCards ||
          fallbackReady
        )
      ) {
        await sleep(1000);
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

      setTimeout(() => {
        void check();
      }, 400);
    };

    void check();
  });
}

import { buildContext } from './env';

const context = buildContext();

export async function runOnce() {
  const  isRunning = !isTaskRunning();
	console.log("isRunning", isRunning);

  if (!isTaskRunning()) return;

  await ensureOrdersReady();
  refreshTaskTTL();

  const country = getCurrentAmazonCountry();
	console.log("current country", country)
  if (!country || !isLogged(country)) {
    clearTask();
    return;
  }
	console.log("begin to check user")
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
    const isDone = await syncOrders(user, context);
    if (isDone) clearTask();
    else refreshTaskTTL();
  } catch (err) {
    console.error("Order fetch failed:", err);
    clearTask();
  }
}
