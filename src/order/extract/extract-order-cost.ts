import { parseMoney } from "@/money/parse-money";

const LABEL_MAP = {
  subtotal: ["subtotal"],
  shipping: ["shipping", "envío", "envio", "costo de envío"],
  tax: ["impuesto", "impuestos", "vat", "estimated tax to be collected"],
  total_before_tax: ["before tax", "antes de impuestos", "total before vat"],
  grand_total: ["grand total", "total del pedido", "total"],
  payment_total: ["payment total", "total del pago", "payment grand total"],
};


function matchLabel(label: string, keys: string[]) {
  return keys.some(k => label.includes(k));
}

export function extractOrderCost(doc: Document, context: {domain?: string}) {
  const container =
    doc.querySelector('[data-component="chargeSummary"]') ??
    doc.querySelector('[data-component="orderSubtotals"]');

  if (!container) return {};

  const rows = Array.from(container.querySelectorAll(".a-row"));

  const cost: Record<string, any> = {};
  let hasExchangeRateHint = false;

  /* ---------- 先探测是否存在汇率区块 ---------- */
  if (container.textContent?.toLowerCase().includes("exchange rate")) {
    hasExchangeRateHint = true;
  }

  for (const row of rows) {
    const labelElem =
      row.querySelector(".od-line-item-row-label") ??
      row.querySelector(".a-column.a-span7");

    const valueElem =
      row.querySelector(".od-line-item-row-content") ??
      row.querySelector(".a-column.a-span5");

    if (!labelElem || !valueElem) continue;

    const label = labelElem.textContent?.trim().toLowerCase();
    const valueText = valueElem.textContent?.trim();
    if (!label || !valueText) continue;

		const parsed = parseMoney(valueText, context);
    if (!Number.isFinite(parsed.amount)) continue;

    let currency = parsed.currency;
		const isUSD = currency === "USD";

    const amount = parsed.amount;

		const isPaymentRow = matchLabel(label, LABEL_MAP.payment_total) || label.includes("payment");


    /* ---------- Payment Total ---------- */
    if (matchLabel(label, LABEL_MAP.payment_total)) {
      cost.payment_total = amount;
      cost.payment_currency = currency;
      continue;
    }

    /* ---------- Total Before Tax ---------- */
    if (matchLabel(label, LABEL_MAP.total_before_tax)) {
      cost.total_before_tax = amount;
      continue;
    }

    /* ---------- Tax ---------- */
    if (matchLabel(label, LABEL_MAP.tax)) {
      cost.tax = amount;
      continue;
    }

    /* ---------- Shipping ---------- */
    if (matchLabel(label, LABEL_MAP.shipping) && !label.includes("tax")) {
      cost.shipping = amount;
      continue;
    }

    /* ---------- Subtotal ---------- */
    if (matchLabel(label, LABEL_MAP.subtotal)) {
      cost.subTotal = amount;
      continue;
    }

		if (matchLabel(label, LABEL_MAP.grand_total)) {
			cost.original_total = amount;
			cost.original_currency = currency;
			if (hasExchangeRateHint && isUSD) {
				cost.payment_total = amount;
				cost.payment_currency = currency;
				continue;
			}
			continue;
		}

  }

	cost.original_cost =
  cost.original_total ??
  cost.subTotal ??
  0;


  return cost;
}
