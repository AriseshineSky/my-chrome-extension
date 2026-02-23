// src/order/extract/extract-order-summary.ts

const ORDER_NUMBER_LABELS = ["Order #", "Pedido n.º", "Order No."]
const ORDER_DATE_LABELS = ["Order Placed", "Pedido realizado"];
const SHIP_TO_LABELS = ["Ship To", "Enviar a", "Send to"];
const PLACED_BY_LABELS = ["Placed By", "Realizado por"];

export function extractOrderSummary(root: Element) {
	const labelOrder = Array.from(root.querySelectorAll("span"))
    .find(el => ORDER_NUMBER_LABELS.some(label => el.textContent?.trim().toLowerCase() === label.toLowerCase()));

  const rowOrder = labelOrder?.closest(".a-row") ?? labelOrder?.parentElement;
  const orderNumber = rowOrder?.textContent?.match(/\b\d{3}-\d{7}-\d{7}\b/)?.[0] ?? null;

	const labelDate = Array.from(root.querySelectorAll(".a-column"))
    .find(col => ORDER_DATE_LABELS.some(label => col.querySelector(".a-row.a-color-secondary")?.textContent.toLowerCase().trim() === label.toLowerCase()));

  let orderDate = labelDate?.querySelector(".a-row.a-size-base")?.textContent.trim() ?? null;
	if (!orderDate) {
    const li = root.querySelector("li.order-header__header-list-item");
    if (li) {
      const label = li.querySelector("span.a-color-secondary.a-text-caps");
      if (ORDER_DATE_LABELS.some(l => label?.textContent.toLowerCase().trim() === l.toLowerCase())) {
        const dateSpan = li.querySelector("span.a-color-secondary.aok-break-word");
        orderDate = dateSpan?.textContent.trim() ?? null;
      }
    }
  }

  const labelShipTo = root.querySelector(".a-column .a-popover-preload .a-text-bold");
  const shipTo = labelShipTo?.textContent.trim() ?? null;

  const labelPlacedBy = root.querySelector(".a-column:nth-child(4) .a-truncate-full");
  const placedBy = labelPlacedBy?.textContent.trim() ?? null;

  return {
    orderNumber: orderNumber ?? "",
    orderDate,
    shipTo,
    placedBy
  };
}

