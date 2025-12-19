// src/order/list/order-selectors.ts
export const ORDER_SELECTOR = "div.order-card, div#orderCard";
export const NEXT_PAGE_SELECTOR = "ul.a-pagination > li.a-last > a";

const ORDER_URL_SELECTOR = `
  a[href*="/gp/css/order-details"],
  a[data-savepage-href*="/gp/css/order-details"],
  a[href*="order-details?orderID="],
  .yohtmlc-order-details-link,
  .yohtmlc-order-level-connections a
`;

export function getOrderDetailUrl(divOrder: Element): string {
  const link = divOrder.querySelector(ORDER_URL_SELECTOR);
  if (!link) {
    throw new Error("Order detail link not found");
  }

  const href =
    link.getAttribute("data-savepage-href") ||
    link.getAttribute("href");

  if (!href) {
    throw new Error("Order detail href missing");
  }

  return href.replace("/gp/css/", "/gp/your-account/");
}


