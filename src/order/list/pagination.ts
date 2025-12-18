const NEXT_PAGE_SELECTOR = "ul.a-pagination > li.a-last > a";

export function goToNextPage(): boolean {
  const nextSel = document.querySelector(NEXT_PAGE_SELECTOR);
  if (!nextSel) return false;

  const nextHref = nextSel.getAttribute("href");
  if (!nextHref) return false;

  const fullUrl = new URL(nextHref, window.location.origin).href;
  window.location.href = fullUrl;
  return true;
}

