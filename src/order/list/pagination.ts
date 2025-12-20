const NEXT_PAGE_SELECTOR = "ul.a-pagination > li.a-last > a";
export async function goToNextPage(
  timeout = 30000,
): Promise<boolean> {
  const nextBtn = getNextButton();

  if (!nextBtn) {
    return false; // 没有下一页
  }

  // 🔥 核心：模拟真实用户点击
  nextBtn.click();

  // 等待 Amazon 重新 hydrate
  await ensureOrdersReady(timeout);

  return true;
}


export function goToNextPage(): boolean {
  const nextSel = document.querySelector(NEXT_PAGE_SELECTOR);
  if (!nextSel) return false;

  const nextHref = nextSel.getAttribute("href");
  if (!nextHref) return false;

  const fullUrl = new URL(nextHref, window.location.origin).href;
  window.location.href = fullUrl;
  return true;
}

