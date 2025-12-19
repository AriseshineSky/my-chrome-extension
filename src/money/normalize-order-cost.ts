// money/normalize-order-cost.ts
import { RATES } from "./rates";

export function normalizeOrderCostToUSD(
  cost: {
    original_currency?: string;
    original_cost?: number;
    payment_total?: number;
    payment_currency?: string;
  }
) {
  const originalCurrency = cost.original_currency;
  const originalCost = cost.original_cost ?? 0;

  // Case 1: 页面直接给了 USD payment
  if (
    cost.payment_total &&
    cost.payment_currency === "USD" &&
    originalCost > 0
  ) {
    return {
      ...cost,
      usd_cost: cost.payment_total,
      exchange_rate:
        originalCurrency === "USD"
          ? 1
          : Number((cost.payment_total / originalCost).toFixed(6)),
      exchange_rate_source: "page",
    };
  }

  // Case 2: 本身就是 USD
  if (originalCurrency === "USD" && originalCost > 0) {
    return {
      ...cost,
      usd_cost: originalCost,
      exchange_rate: 1,
      exchange_rate_source: "identity",
    };
  }

  // Case 3: 用默认汇率
  const rate = originalCurrency ? RATES[originalCurrency] : null;
  if (rate && originalCost > 0) {
    return {
      ...cost,
      usd_cost: Number((originalCost * rate).toFixed(2)),
      exchange_rate: rate,
      exchange_rate_source: "default",
    };
  }

  // Case 4: 无法计算
  return {
    ...cost,
    usd_cost: 0,
    exchange_rate: 1,
    exchange_rate_source: "unknown",
  };
}

