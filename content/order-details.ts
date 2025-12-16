import { RATES } from "./rate";

export interface ShipmentInfo {
}

export interface OrderInfo {
  buy_order_number: string;
  buy_order_date: string;
  original_currency: string;
  original_cost: number;
  usd_cost: number;
  subTotal: number;
  tax: number;
  shipping: number;
  total: number;
  exchange_rate: number;
  address: string;
  paymentMethod: string | null;
  placedBy: string | null;
  shipments?: ShipmentInfo[];
}

function parseCurrency(str: string) {
  const match = str.match(/([£$€])\s*([\d.,]+)/);
  if (!match) return { currency: "UNKNOWN", amount: 0 };

  let [ , symbol, amount ] = match;
  amount = amount.replace(",", ".");

  let currency: string;
  switch(symbol) {
    case "£": currency = "GBP"; break;
    case "$": currency = "USD"; break;
    case "€": currency = "EUR"; break;
    default: currency = "UNKNOWN"; 
  }

  return { currency, amount: Number(amount) };
}

async function convertToUSD(amount: number, currency: string): Promise<{ usd: number, rate: number }> {
  if (currency === "USD") return { usd: amount, rate: 1 };
  const rate = RATES[currency]?.USD ?? 1;
  return { usd: Number((amount * rate).toFixed(2)), rate };
}

function getTextContent(elem: Element | null): string {
  if (!elem) return "";
  return Array.from(elem.childNodes)
    .map(node => node.textContent?.trim() ?? "")
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();
}

async function convertOrderCostToUSD(cost: Record<string, any>) {
  if (cost.paymentGrandTotal && cost.total && cost.original_currency) {
    const rate = cost.paymentGrandTotal / cost.total;
    return {
      ...cost,
      usd_cost: Number((cost.total * rate).toFixed(2)),
      exchange_rate: Number(rate.toFixed(4)),
    };
  }

  // 如果原币是 USD，就直接返回
  if (cost.original_currency === "USD") {
    return {
      ...cost,
      usd_cost: cost.original_cost,
      exchange_rate: 1,
    };
  }

  // 否则 fallback 到原来的 RATES 表
  if (cost.original_currency && cost.original_cost) {
    const rate = RATES[cost.original_currency]?.USD ?? 1;
    return {
      ...cost,
      usd_cost: Number((cost.original_cost * rate).toFixed(2)),
      exchange_rate: rate,
    };
  }

  return cost;
}

function normalizeCurrency(raw: string): string {
  const map: Record<string, string> = {
    '$': 'USD',
    'USD': 'USD',
    '£': 'GBP',
    'GBP': 'GBP',
    '€': 'EUR',
    'EUR': 'EUR',
    'JPY': 'JPY',
    'CAD': 'CAD',
    'AUD': 'AUD',
  };

  return map[raw] ?? raw;
}

export function getOrderCost(doc: Document) {
  const container =
    doc.querySelector('[data-component="chargeSummary"]') ??
    doc.querySelector('[data-component="orderSubtotals"]');

  if (!container) return {};

  const rows = Array.from(container.querySelectorAll('.a-row'));
  const cost: Record<string, any> = {};

  rows.forEach(row => {
    const labelElem = row.querySelector(
      '.a-column.a-span7, .od-line-item-row-label'
    );
    const valueElem = row.querySelector(
      '.a-column.a-span5, .od-line-item-row-content'
    );

    if (!labelElem || !valueElem) return;

    const label = labelElem.textContent?.trim();
    const valueText = valueElem.textContent?.trim();
    if (!label || !valueText) return;

    // 支持负数 + 币种
    const match = valueText.match(/(-?)\s*([£$€A-Z]{1,3})\s*([\d.,]+)/);
    if (!match) return;

    const [, sign, rawCurrency, rawAmount] = match;
		const currency = normalizeCurrency(rawCurrency);
    const numAmount =
      Number(rawAmount.replace(/,/g, '')) * (sign === '-' ? -1 : 1);

    switch (true) {
      case /Item\(s\)\s*Subtotal/i.test(label):
        cost.subTotal = numAmount;
        cost.original_currency = currency;
        break;

      case /Shipping|Postage|Handling/i.test(label):
        cost.shipping = numAmount;
        break;

      case /Promotion/i.test(label):
        cost.promotion = numAmount; // 保留负数
        break;

      case /Total before tax/i.test(label):
        cost.subTotalBeforeTax = numAmount;
        break;

      case /Estimated tax|VAT|Tax/i.test(label):
        cost.tax = numAmount;
        break;

      case /Payment Grand Total/i.test(label):
        cost.paymentGrandTotal = numAmount;
        cost.paymentGrandCurrency = currency;
        break;

      case /Grand Total/i.test(label):
        cost.total = numAmount;
        cost.grandTotal = numAmount;
        cost.original_cost = numAmount;
        break;
    }
  });

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
    buy_order_number: "",
    buy_order_date: "",
    subTotal: costWithUSD.subTotal ?? 0,
    tax: costWithUSD.tax ?? 0,
    shipping: costWithUSD.shipping ?? 0,
    total: costWithUSD.total ?? 0,
    original_currency: costWithUSD.original_currency ?? "UNKNOWN",
    original_cost: costWithUSD.original_cost ?? 0,
    usd_cost: costWithUSD.usd_cost ?? 0,
    exchange_rate: costWithUSD.exchange_rate ?? 1,
    address: getShippingAddress(doc),
    paymentMethod: getPaymentMethod(doc),
  };
}
