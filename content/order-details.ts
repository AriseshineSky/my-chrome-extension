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

async function convertOrderCostToUSD(cost: Record<string, any>) {
  if (cost.payment_total && cost.total && cost.original_currency) {
    const rate = cost.payment_total / cost.total;
    return {
      ...cost,
      usd_cost: Number((cost.total * rate).toFixed(2)),
      exchange_rate: Number(rate.toFixed(4)),
    };
  }

  if (cost.original_currency === "USD") {
    return {
      ...cost,
      usd_cost: cost.original_cost,
      exchange_rate: 1,
    };
  }

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



export function getOrderCost(doc: Document) {
  const container =
    doc.querySelector('[data-component="chargeSummary"]') ??
    doc.querySelector('[data-component="orderSubtotals"]');

  if (!container) return {};

  const rows = Array.from(
    container.querySelectorAll('.a-row.od-line-item-row, .a-row')
  );

  const cost: Record<string, any> = {};

  let firstCurrency: string | null = null;

  rows.forEach(row => {
    const labelElem =
      row.querySelector('.od-line-item-row-label') ??
      row.querySelector('.a-column.a-span7');

    const valueElem =
      row.querySelector('.od-line-item-row-content') ??
      row.querySelector('.a-column.a-span5');

    if (!labelElem || !valueElem) return;

    const label = labelElem.textContent?.trim();
    const valueText = valueElem.textContent?.trim();
    if (!label || !valueText) return;

    const { amount, currency } = parseMoney(valueText);
    if (Number.isNaN(amount)) return;

    if (!firstCurrency && currency) {
      firstCurrency = currency;
    }

    // ---------- label 归一 ----------
    const normalized = label.toLowerCase();

    if (normalized.includes('subtotal')) {
      cost.subTotal = amount;
      cost.original_currency ||= currency;
    }

    if (normalized.includes('shipping') || normalized.includes('postage')) {
      cost.shipping = amount;
    }

    if (normalized.includes('promotion')) {
      cost.promotion = amount;
    }

    if (normalized.includes('vat') || normalized.includes('tax')) {
      cost.tax = amount;
    }

    if (
      normalized.includes('payment') &&
      normalized.includes('total')
    ) {
      cost.payment_total = amount;
      cost.payment_currency = currency;
    }

    if (
      normalized === 'total:' ||
      (normalized.includes('total') && !normalized.includes('payment'))
    ) {
      cost.original_total = amount;
      cost.original_currency ||= currency;
    }

    if (normalized.includes('grand total')) {
      if (!cost.payment_total) {
        cost.payment_total = amount;
        cost.payment_currency ||= currency;
      }
      cost.grand_total = amount;
    }
  });

  // ---------- fallback ----------
  if (!cost.payment_total && cost.original_total) {
    cost.payment_total = cost.original_total;
    cost.payment_currency = cost.original_currency;
  }

  // ---------- exchange rate ----------
  if (
    cost.original_total &&
    cost.payment_total &&
    cost.original_currency &&
    cost.payment_currency
  ) {
    cost.exchange_rate =
      cost.payment_currency === cost.original_currency
        ? 1
        : Number(
            (cost.payment_total / cost.original_total).toFixed(6)
          );
  }

	// 1. original_cost
	if (!cost.original_cost) {
		cost.original_cost =
			cost.original_total ??
			cost.grand_total ??
			0;
	}
	// === usd_cost ===
	if (cost.payment_total) {
		cost.usd_cost = cost.payment_total;
	} else if (
		cost.original_currency !== 'USD' &&
		cost.original_cost > 0 &&
		cost.exchange_rate > 0
	) {
		// 2️⃣ ACC 兜底
		cost.usd_cost = Number(
			(cost.original_cost * cost.exchange_rate).toFixed(2)
		);

	} else if (cost.original_currency === 'USD') {
		// 3️⃣ 美站
		cost.usd_cost = cost.original_cost;

	} else {
		cost.usd_cost = 0;
	}

	// 3. exchange_rate
	if (
		cost.original_cost > 0 &&
		cost.usd_cost > 0 &&
		cost.original_currency !== 'USD'
	) {
		cost.exchange_rate = Number(
			(cost.usd_cost / cost.original_cost).toFixed(6)
		);
	} else {
		cost.exchange_rate = 1;
	}

	// 4. total（如果你还想保留）
	cost.total = cost.usd_cost || cost.original_cost;
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
    usd_cost: costWithUSD.payment_total ?? 0,
    exchange_rate: costWithUSD.exchange_rate ?? 1,
    address: getShippingAddress(doc),
    paymentMethod: getPaymentMethod(doc),
  };
}
