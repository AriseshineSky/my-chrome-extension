const NEXT_PAGE_SELECTOR = "ul.a-pagination > li.a-last > a";
import { ORDER_SELECTOR } from "./order-selectors";

import { ensureOrdersReady } from "@/content/runtime/run-once";

function waitForUrlOrDomChange(
  prevUrl: string,
  timeout: number,
): Promise<void> {
  return new Promise((resolve, reject) => {
    const start = Date.now();

    const observer = new MutationObserver(() => {
      if (location.href !== prevUrl) {
        observer.disconnect();
        resolve();
      }
    });

    const container = document.querySelector(ORDER_SELECTOR);
    if (container) {
      observer.observe(container, { childList: true, subtree: true });
    }

    const timer = setInterval(() => {
      if (location.href !== prevUrl) {
        cleanup();
        resolve();
      }

      if (Date.now() - start > timeout) {
        cleanup();
        reject(new Error("Pagination timeout"));
      }
    }, 300);

    function cleanup() {
      observer.disconnect();
      clearInterval(timer);
    }
  });
}

export async function goToNextPage(
  timeout = 30000,
): Promise<boolean> {

  // ✅ 每次重新获取（关键）
  const nextBtn = document.querySelector(
    NEXT_PAGE_SELECTOR,
  ) as HTMLAnchorElement | null;

  console.log("nextBtn connected:", nextBtn?.isConnected);

  if (!nextBtn || !nextBtn.isConnected) {
    return false;
  }

  const prevUrl = location.href;

  nextBtn.click();

  try {
    // 👇 两种方式都兜住
    await Promise.race([
      ensureOrdersReady(timeout),              // 普通账号
      waitForUrlOrDomChange(prevUrl, timeout), // Business AJAX
    ]);
  } catch (e) {
    console.warn("Next page failed:", e);
    return false;
  }

  return true;
}

