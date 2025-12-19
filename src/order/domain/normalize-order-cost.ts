// src/order/domain/normalize-order-cost.ts
import { RATES } from "@/money/rates";

export function normalizeOrderCost(raw: Record<string, any>) {
  const originalCurrency = raw.original_currency;
  const originalCost = raw.original_cost ?? raw.original_total ?? 0;

  let usdCost = 0;
  let exchangeRate = 1;

  // 1️⃣ 页面已给 USD payment（ACC）
  if (
    raw.payment_total &&
    raw.payment_currency === "USD" &&
    originalCost > 0
  ) {
    usdCost = raw.payment_total;
    exchangeRate =
      originalCurrency === "USD"
        ? 1
        : Number((usdCost / originalCost).toFixed(6));
  }
  // 2️⃣ 原币就是 USD
  else if (originalCurrency === "USD") {
    usdCost = originalCost;
    exchangeRate = 1;
  }
  // 3️⃣ fallback：用内置汇率
  else if (originalCurrency && RATES[originalCurrency]) {
    exchangeRate = RATES[originalCurrency];
    usdCost = Number((originalCost * exchangeRate).toFixed(2));
  }

  return {
    subTotal: raw.subTotal ?? 0,
    shipping: raw.shipping ?? 0,
    tax: raw.tax ?? 0,

    original_currency: originalCurrency,
    original_cost: originalCost,

    usd_cost: usdCost,
    exchange_rate: exchangeRate,

    payment_currency: raw.payment_currency,
    payment_total: raw.payment_total,
  };
}

