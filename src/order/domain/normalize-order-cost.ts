// src/order/domain/normalize-order-cost.ts
import { RATES } from "@/money/rates";

export function normalizeOrderCost(raw: Record<string, any>) {
  const originalCurrency = raw.original_currency;
  const originalCost = raw.original_cost ?? raw.original_total ?? 0;

  let finalPaidUSD = 0;
  let exchangeRate = 1;

  if (
    raw.payment_total &&
    raw.payment_currency === "USD" &&
    originalCost > 0
  ) {
    finalPaidUSD = raw.payment_total;
    exchangeRate =
      originalCurrency === "USD"
        ? 1
        : Number((finalPaidUSD / originalCost).toFixed(6));
  }

  // 2️⃣ 非 ACC，但原币就是 USD
  else if (originalCurrency === "USD" && originalCost > 0) {
    finalPaidUSD = originalCost;
    exchangeRate = 1;
  }

  // 3️⃣ 外币非 ACC，用内置汇率
  else if (originalCurrency && RATES[originalCurrency] && originalCost > 0) {
    exchangeRate = RATES[originalCurrency];
    finalPaidUSD = Number((originalCost * exchangeRate).toFixed(2));
  }

  const cost = {
    subTotal: raw.subTotal ?? 0,
    shipping: raw.shipping ?? 0,
    tax: raw.tax ?? 0,

    original_currency: originalCurrency,
    original_cost: originalCost,

    final_paid_usd: finalPaidUSD,
    usd_cost: finalPaidUSD,
    exchange_rate: exchangeRate,

    payment_currency: raw.payment_currency,
    payment_total: raw.payment_total,
  };
	return cost;
}

