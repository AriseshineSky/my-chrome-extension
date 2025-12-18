import { RATES } from "./rate";

export interface ShipmentInfo {
}

export interface OrderInfo {
  buy_order_number: string;
  buy_order_date: string;
  original_currency: string;
  original_cost: number;
	original_total: number;
  usd_cost: number;
  subTotal: number;
  tax: number;
  shipping: number;
  exchange_rate: number;
  address: string;
  paymentMethod: string | null;
  placedBy: string | null;
  shipments?: ShipmentInfo[];
}

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

  // ---------- Case 4: 无法计算 ----------
  return {
    ...cost,
    usd_cost: 0,
    exchange_rate: 1,
    exchange_rate_source: 'unknown',
  };
}

const SYMBOL_TO_CURRENCY: Record<string, string> = {
  '$': 'USD',
  '£': 'GBP',
  '€': 'EUR',
};

export function parseMoney(text: string): {
  amount: number;
  currency: string | null;
} {
  if (!text) return { amount: NaN, currency: null };

  const clean = text.replace(/\s+/g, ' ').trim();

  // 1️⃣ ISO code：USD 26.80
  const isoMatch = clean.match(/^([A-Z]{3})\s*([\d,.]+)/);
  if (isoMatch) {
    return {
      currency: isoMatch[1],
      amount: Number(isoMatch[2].replace(/,/g, '')),
    };
  }

  // 2️⃣ Symbol：$26.80 / £ 83.80
  const symbolMatch = clean.match(/^([$£€])\s*([\d,.]+)/);
  if (symbolMatch) {
    return {
      currency: SYMBOL_TO_CURRENCY[symbolMatch[1]] ?? null,
      amount: Number(symbolMatch[2].replace(/,/g, '')),
    };
  }

  // 3️⃣ Promotion: -$0.90
  const negativeMatch = clean.match(/^-\s*([$£€])\s*([\d,.]+)/);
  if (negativeMatch) {
    return {
      currency: SYMBOL_TO_CURRENCY[negativeMatch[1]] ?? null,
      amount: -Number(negativeMatch[2].replace(/,/g, '')),
    };
  }

  return { amount: NaN, currency: null };
}
interface OrderCost {
  subTotal?: number;
  shipping?: number;
  promotion?: number;
  tax?: number;
  total_before_tax?: number;
  original_total?: number;        // 订单原币种最终总价
  original_currency?: string;
  payment_total?: number;         // 实际支付金额（可能是 USD）
  payment_currency?: string;
  usd_cost?: number;              // 统一 USD
  exchange_rate?: number;
}

export function getOrderCost(doc: Document) {
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

export function getPaymentMethod(doc: Document): string | null {
  // ---------- 1️⃣ 旧版 DOM（向后兼容） ----------
  const legacyContainer = doc.querySelector(
    '[data-component="viewPaymentPlanSummaryWidget"]'
  );

  if (legacyContainer) {
    const li = legacyContainer.querySelector(
      'li.pmts-payments-instrument-detail-box-paystationpaymentmethod span.a-list-item'
    );

    if (li) {
      const text = Array.from(li.childNodes)
        .map(node => node.textContent?.trim())
        .filter(Boolean)
        .join(" ")
        .replace(/\s+/g, " ")
        .trim();

      if (text) return text;
    }
  }

  // ---------- 2️⃣ 新版 Next.js (__NEXT_DATA__) ----------
  const nextScript = doc.querySelector('#__NEXT_DATA__');
  if (!nextScript?.textContent) return null;

  let data: any;
  try {
    data = JSON.parse(nextScript.textContent);
  } catch {
    return null;
  }

  const list =
    data?.props?.pageProps?.applicationData
      ?.getSelectedPaymentMethodsResponse
      ?.displayResponse
      ?.paymentMethodInstrumentDisplayList
      ?.paymentMethodInstrumentDisplayDatumList;

  if (!Array.isArray(list) || list.length === 0) return null;

  const core = list[0].paymentMethodDisplayDatumCore;

  const brand = core?.paymentMethodHeader; // Visa
  const last4 = core?.paymentMethodNumber?.lastDigits; // 9618

  if (!brand && !last4) return null;

  return [brand, last4 ? `•••• ${last4}` : null]
    .filter(Boolean)
    .join(" ");
}

function getShippingAddress(doc: Document): string {
  const container = doc.querySelector('[data-component="shippingAddress"]');
  if (!container) return "";
  const lines = Array.from(container.querySelectorAll("li")).map(li => li.textContent?.trim()).filter(Boolean);
  return lines.join(", ");
}


export async function getOrderBasicInfo(doc: Document) {
  const costInfo = getOrderCost(doc);
  const costWithUSD = await convertOrderCostToUSD(costInfo);

  return {
    subTotal: costWithUSD.subTotal ?? 0,
    tax: costWithUSD.tax ?? 0,
    shipping: costWithUSD.shipping ?? 0,


    original_currency: costWithUSD.original_currency ?? "UNKNOWN",
    original_cost: costWithUSD.original_cost ?? 0,

    usd_cost: costWithUSD.usd_cost ?? 0,
    exchange_rate: costWithUSD.exchange_rate ?? 1,

    address: getShippingAddress(doc),
    paymentMethod: getPaymentMethod(doc),
  };
}

