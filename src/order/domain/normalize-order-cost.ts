// src/order/domain/normalize-order-cost.ts
import { RATES } from "@/money/rates";

export function normalizeOrderCost(raw: Record<string, any>) {
  const originalCurrency = raw.original_currency;
  const originalCost =
    Number(raw.original_cost ?? raw.original_total ?? 0);

  let exchangeRate = 1;
  let finalPaidUSD = 0;

  /* ---------- Case 1: ACC，页面给了 USD payment ---------- */
  if (
    typeof raw.payment_total === "number" &&
    raw.payment_total > 0 &&
    raw.payment_currency === "USD" &&
    originalCost > 0
  ) {
    finalPaidUSD = raw.payment_total;
    exchangeRate =
      originalCurrency === "USD"
        ? 1
        : Number((finalPaidUSD / originalCost).toFixed(6));
  }

  /* ---------- Case 2: 非 ACC，但原币就是 USD ---------- */
  else if (originalCurrency === "USD" && originalCost > 0) {
    finalPaidUSD = originalCost;
    exchangeRate = 1;
  }

  /* ---------- Case 3: 外币，使用系统汇率 ---------- */
  else if (
    originalCurrency &&
    typeof RATES[originalCurrency] === "number" &&
    originalCost > 0
  ) {
    exchangeRate = RATES[originalCurrency];
    finalPaidUSD = Number((originalCost * exchangeRate).toFixed(2));
  }

  /* ---------- Fallback ---------- */
  else {
    finalPaidUSD = 0;
    exchangeRate = 1;
  }

  return {
    /* --- 明确数值字段 --- */
    subTotal: Number(raw.subTotal ?? 0),
    shipping: Number(raw.shipping ?? 0),
    tax: Number(raw.tax ?? 0),

    /* --- 原币信息 --- */
    original_currency: originalCurrency ?? "UNKNOWN",
    original_cost: originalCost,

    /* --- USD 统一口径 --- */
    usd_cost: finalPaidUSD,
    final_paid_usd: finalPaidUSD,
    exchange_rate: exchangeRate,

    /* --- 原始支付信息（允许为空） --- */
    payment_currency: raw.payment_currency ?? null,
    payment_total:
      typeof raw.payment_total === "number"
        ? raw.payment_total
        : null,
  };
}


