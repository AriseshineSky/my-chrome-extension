const NEXT_PAGE_SELECTOR = "ul.a-pagination > li.a-last > a";

import { ORDER_SELECTOR } from "./order-selectors";
import { ensureOrdersReady } from "@/content/runtime/run-once";

function getCurrentPage(): number {
  const match = location.hash.match(/pagination\/(\d+)/);
  return match ? Number(match[1]) : 1;
}

function getNextPageUrl(): string | null {
  const nextLink = document.querySelector<HTMLAnchorElement>(
    'li.a-last a[href]'
  );
  if (!nextLink) return null;

  const href = nextLink.getAttribute("href")!;
	console.log("href")
	console.log(href)
  
  // Case A: 真实 URL

	const url = new URL(href, location.origin);
  const startIndex = url.searchParams.get("startIndex");
	if (startIndex !== null) {
		return href;
	}


  // Case B: #pagination/next/
  if (href.includes("#pagination/next")) {
    const current = getCurrentPage();

		const base = "/gp/your-account/order-history";
		const url = `${base}#pagination/${current + 1}/`;
		return url;
	}

  return null;
}

function goToPage(url: string) {
  location.href = url;
}

async function goToNextPageSafe() {
	await ensureOrdersReady();
	const nextPage = getNextPageUrl();
	if (!nextPage) {
		return null;
	}

	goToPage(nextPage);

	await new Promise(r => setTimeout(r, 1500));

  return true;
}


export async function goToNextPage(
  timeout = 30000,
) {
	console.log("current")
	console.log(location.href)
	await goToNextPageSafe()
}
