// src/shipment/extract/extract-order-items.ts
import {
  ORDER_ITEM_SELECTOR,
  ORDER_ITEM_URL_SELECTOR,
  ORDER_ITEM_PRICE_SELECTOR,
  ORDER_ITEM_QUANTITY_SELECTOR,
} from "../selectors";

import { OrderItem } from "@/domain/OrderItem";

/**
 * 从一个 shipment DOM 节点中抽取所有订单商品
 */
export function extractOrderItems(
  shipmentElem: Element,
): Record<string, OrderItem> {
  const elems = shipmentElem.querySelectorAll(ORDER_ITEM_SELECTOR);
  const items: Record<string, OrderItem> = {};

  for (const elem of Array.from(elems)) {
    const item = extractOrderItem(elem);
    if (!item) continue;
    items[item.asin] = item;
  }

  return items;
}

/* ---------------- private helpers ---------------- */
const SYMBOL_TO_CURRENCY: Record<string, string> = {
  "$": "USD",
  "£": "GBP",
  "€": "EUR",
};


function extractOrderItem(
  elem: Element,
): OrderItem | null {
  const link = elem.querySelector(ORDER_ITEM_URL_SELECTOR);
  const href = link?.getAttribute("href");
  if (!href) return null;

  const asin = extractAsin(href);
  if (!asin) return null;

  const priceText =
    elem.querySelector(ORDER_ITEM_PRICE_SELECTOR)?.textContent?.trim() ?? "";

  const quantity = extractQuantity(elem);

  const originalPrice = extractOriginalAmount(priceText);
  const originalCurrency = extractCurrency(priceText);


  return {
    asin,
    quantity,
    originalPrice,
    originalCurrency,
    originalCost: Number((originalPrice * quantity).toFixed(2)),
    priceText,
  };
}

function extractAsin(url: string): string | null {
  return (
    url.match(/\/dp\/([A-Z0-9]{8,})/i)?.[1] ??
    url.match(/\/gp\/product\/([A-Z0-9]{8,})/i)?.[1] ??
    null
  );
}

function extractQuantity(elem: Element): number {
  const text =
    elem.querySelector(ORDER_ITEM_QUANTITY_SELECTOR)?.textContent?.trim();
  const n = text ? Number(text) : 1;
  return Number.isFinite(n) && n > 0 ? n : 1;
}

function extractOriginalAmount(priceText: string): number {
  const match = priceText.match(/([\d,.]+)/);
  return match ? Number(match[1].replace(/,/g, "")) : 0;
}

function extractCurrency(priceText: string): string | null {
  if (!priceText) return null;

  // 1️⃣ ISO code：USD 12.34
  const isoMatch = priceText.match(/\b([A-Z]{3})\b/);
  if (isoMatch) {
    return isoMatch[1];
  }

  // 2️⃣ Symbol：$12.34 / £12.34 / €12.34
  const symbolMatch = priceText.match(/^([£$€])/);
  if (symbolMatch) {
    return SYMBOL_TO_CURRENCY[symbolMatch[1]] ?? null;
  }

  return null;
}
