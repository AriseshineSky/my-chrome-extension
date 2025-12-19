// order/flow/get-order-basic-info.ts
import { extractOrderCost } from "../extract/extract-order-cost";
import { normalizeOrderCostToUSD } from "../../money/normalize-order-cost";
import { NormalizedCost } from "@/domain/NormalizedCost";

export function getOrderBasicInfo(doc: Document) {
  const rawCost = extractOrderCost(doc);
  const normalized: NormalizedCost = normalizeOrderCostToUSD(rawCost);

  return {
    subTotal: normalized.subTotal ?? 0,
    tax: normalized.tax ?? 0,
    shipping: normalized.shipping ?? 0,

    original_currency: normalized.original_currency ?? "UNKNOWN",
    original_cost: normalized.original_cost ?? 0,

    usd_cost: normalized.usd_cost ?? 0,
    exchange_rate: normalized.exchange_rate ?? 1,
    exchange_rate_source: normalized.exchange_rate_source,
  };
}

