import { parseMoney } from "../../money/parse-money";
import { RATES } from "../../money/rates";

async function convertOrderCostToUSD(
  cost: Record<string, any>
) {
  const originalCurrency = cost.original_currency;
  const originalCost = cost.original_cost;

  // ---------- Case 1: 页面提供了 USD 支付金额（ACC / 跨币） ----------
  if (
    cost.payment_total &&
    cost.payment_currency === 'USD' &&
    originalCost > 0
  ) {
    const rate =
      originalCurrency === 'USD'
        ? 1
        : Number((cost.payment_total / originalCost).toFixed(6));

    return {
      ...cost,
      usd_cost: cost.payment_total,
      exchange_rate: rate,
      exchange_rate_source: 'page',
    };
  }

  // ---------- Case 2: 原币就是 USD ----------
  if (originalCurrency === 'USD' && originalCost > 0) {
    return {
      ...cost,
      usd_cost: originalCost,
      exchange_rate: 1,
      exchange_rate_source: 'identity',
    };
  }

  // ---------- Case 3: 使用币种默认汇率 ----------
  if (originalCurrency && originalCost > 0) {
    const rate = RATES[originalCurrency];

    if (rate) {
      return {
        ...cost,
        usd_cost: Number((originalCost * rate).toFixed(2)),
        exchange_rate: rate,
        exchange_rate_source: 'default',
      };
    }
  }

  return {
    ...cost,
    usd_cost: 0,
    exchange_rate: 1,
    exchange_rate_source: 'unknown',
  };
}

export async function getOrderBasicInfo(doc: Document) {
  const costInfo = extractOrderCost(doc);
  const costWithUSD = await convertOrderCostToUSD(costInfo);

  return {
    subTotal: costWithUSD.subTotal ?? 0,
    tax: costWithUSD.tax ?? 0,
    shipping: costWithUSD.shipping ?? 0,


    original_currency: costWithUSD.original_currency ?? "UNKNOWN",
    original_cost: costWithUSD.original_cost ?? 0,

    usd_cost: costWithUSD.usd_cost ?? 0,
    exchange_rate: costWithUSD.exchange_rate ?? 1,
  };
}


export function extractOrderCost(doc: Document) {
  const container =
    doc.querySelector('[data-component="chargeSummary"]') ??
    doc.querySelector('[data-component="orderSubtotals"]');

  if (!container) return {};

  const rows = Array.from(container.querySelectorAll('.a-row'));

  const cost: Record<string, any> = {};

  let candidates: {
    label: string;
    amount: number;
    currency?: string;
  }[] = [];

  for (const row of rows) {
    const labelElem =
      row.querySelector('.od-line-item-row-label') ??
      row.querySelector('.a-column.a-span7');

    const valueElem =
      row.querySelector('.od-line-item-row-content') ??
      row.querySelector('.a-column.a-span5');

    if (!labelElem || !valueElem) continue;

    const label = labelElem.textContent?.trim();
    const valueText = valueElem.textContent?.trim();
    if (!label || !valueText) continue;

    const { amount, currency } = parseMoney(valueText);
    if (Number.isNaN(amount)) continue;

    const normalized = label.toLowerCase();

    // ---- 基础字段 ----
    if (normalized.includes('subtotal') && !normalized.includes('before')) {
      cost.subTotal = amount;
    }

    if (
      normalized.includes('shipping') ||
      normalized.includes('postage')
    ) {
      cost.shipping = amount;
    }

    if (normalized.includes('promotion')) {
      cost.promotion = -Math.abs(amount);
    }

    if (
      normalized === 'vat:' ||
      normalized.includes('estimated tax') ||
      normalized.includes(' tax')
    ) {
      cost.tax = amount;
    }

    if (normalized.includes('before') && normalized.includes('total')) {
      cost.total_before_tax = amount;
    }

    // ---- 收集候选 total ----
    if (normalized.includes('total')) {
      candidates.push({ label: normalized, amount, currency });
    }
  }

  // ---------- 决定最终 total（按优先级） ----------
  const pick = (kw: string) =>
    candidates.find(c => c.label.includes(kw));

  const paymentTotal = pick('payment');
  const grandTotal = pick('grand');
  const plainTotal = pick('total:');

  if (paymentTotal) {
    cost.payment_total = paymentTotal.amount;
    cost.payment_currency = paymentTotal.currency;
  }

  const finalOriginal =
    grandTotal ?? plainTotal ?? paymentTotal;

  if (finalOriginal) {
    cost.original_total = finalOriginal.amount;
    cost.original_currency = finalOriginal.currency;
  }

  // ---------- original_cost ----------
  cost.original_cost =
    cost.original_total ??
    cost.subTotal ??
    0;

  // ---------- USD / 汇率 ----------
  if (cost.payment_currency && cost.payment_currency !== cost.original_currency) {
    // ACC
    cost.usd_cost = cost.payment_total;
    cost.exchange_rate = Number(
      (cost.payment_total / cost.original_cost).toFixed(6)
    );
  } else {
    // 同币
    cost.usd_cost =
      cost.original_currency === 'USD'
        ? cost.original_cost
        : cost.original_cost;
    cost.exchange_rate = 1;
  }


  return cost;
}
