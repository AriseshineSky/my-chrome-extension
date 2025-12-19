// src/order/extract/extract-order-summary.ts
export function extractOrderSummary(root: Element) {
  const labelOrder = Array.from(root.querySelectorAll("span"))
    .find(el => el.textContent?.trim() === "Order #");
  const rowOrder = labelOrder?.closest(".a-row") ?? labelOrder?.parentElement;
  const orderNumber = rowOrder?.textContent?.match(/\b\d{3}-\d{7}-\d{7}\b/)?.[0] ?? null;

  const labelDate = Array.from(root.querySelectorAll(".a-column"))
    .find(col => col.querySelector(".a-row.a-color-secondary")?.textContent.trim() === "Order placed");
  let orderDate = labelDate?.querySelector(".a-row.a-size-base")?.textContent.trim() ?? null;

  if (!orderDate) {
    const li = root.querySelector("li.order-header__header-list-item");
    if (li) {
      const label = li.querySelector("span.a-color-secondary.a-text-caps");
      if (label?.textContent.trim() === "Order placed") {
        const dateSpan = li.querySelector("span.a-size-base.a-color-secondary.aok-break-word");
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

