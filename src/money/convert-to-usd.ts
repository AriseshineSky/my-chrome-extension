import { RATES } from "./rates";

export async function convertOrderCostToUSD(cost: Record<string, any>) {
  const originalCurrency = cost.original_currency;
  const originalCost = cost.original_cost;

  if (
    cost.payment_total &&
    cost.payment_currency === "USD" &&
    originalCost > 0
  ) {
    const rate =
      originalCurrency === "USD"
        ? 1
        : Number((cost.payment_total / originalCost).toFixed(6));

    return {
      ...cost,
      usd_cost: cost.payment_total,
      exchange_rate: rate,
      exchange_rate_source: "page",
    };
  }

  if (originalCurrency === "USD" && originalCost > 0) {
    return {
      ...cost,
      usd_cost: originalCost,
      exchange_rate: 1,
      exchange_rate_source: "identity",
    };
  }

  const rate = RATES[originalCurrency];
  if (rate && originalCost > 0) {
    return {
      ...cost,
      usd_cost: Number((originalCost * rate).toFixed(2)),
      exchange_rate: rate,
      exchange_rate_source: "default",
    };
  }

  return {
    ...cost,
    usd_cost: 0,
    exchange_rate: 1,
    exchange_rate_source: "unknown",
  };
}

