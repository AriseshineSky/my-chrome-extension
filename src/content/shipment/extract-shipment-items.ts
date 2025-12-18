import { parseMoney } from "../../money-utils";

const ORDER_ITEM_SELECTOR = ':scope div.a-fixed-left-grid';
const URL_SELECTOR =
  ':scope div.yohtmlc-item a, div[data-component="itemTitle"] a';
const PRICE_SELECTOR =
  ':scope span.a-color-price, div[data-component="unitPrice"] span.a-offscreen';
const QUANTITY_SELECTOR = ':scope div.od-item-view-qty';

export interface ExtractedShipmentItem {
  asin: string;
  quantity: number;
  priceStr: string;
  originalAmount: number;
  originalCurrency: string | null;
  originalCost: number;
}

export function extractShipmentItems(
  shipmentElem: Element,
): Record<string, ExtractedShipmentItem> {
  const elems = shipmentElem.querySelectorAll(ORDER_ITEM_SELECTOR);
  const items: Record<string, ExtractedShipmentItem> = {};

  for (const el of elems) {
    const item = extractSingleItem(el);
    if (item) {
      items[item.asin] = item;
    }
  }

  return items;
}

function extractSingleItem(
  orderItemElem: Element,
): ExtractedShipmentItem | null {
  const link = orderItemElem.querySelector(URL_SELECTOR);
  const url = link?.getAttribute("href");
  if (!url) return null;

  const asin = extractAsinFromUrl(url);
  if (!asin) return null;

  const priceStr =
    orderItemElem.querySelector(PRICE_SELECTOR)?.textContent?.trim() ?? "";

  const { amount, currency } = parseMoney(priceStr);

  let quantity = 1;
  const qtyEl = orderItemElem.querySelector(QUANTITY_SELECTOR);
  if (qtyEl?.textContent) {
    quantity = Number(qtyEl.textContent.trim()) || 1;
  }

  return {
    asin,
    quantity,
    priceStr,
    originalAmount: amount,
    originalCurrency: currency,
    originalCost: Number((amount * quantity).toFixed(2)),
  };
}

function extractAsinFromUrl(url: string): string | null {
  return (
    url.match(/\/dp\/([A-Z0-9]{10})/)?.[1] ??
    url.match(/\/gp\/product\/([A-Z0-9]{10})/)?.[1] ??
    null
  );
}

