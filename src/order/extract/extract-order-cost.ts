import { parseMoney } from "@/money/parse-money";

export function extractOrderCost(doc: Document) {
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

    const { amount, currency } = parseMoney(valueText);
    if (!Number.isFinite(amount)) continue;

    /* ---------- 明确 Payment Total（双行模式） ---------- */
    if (label.includes("payment") && label.includes("total")) {
      cost.payment_total = amount;
      cost.payment_currency = currency;
      continue;
    }

		if (label.includes("grand total")) {
      cost.original_total = amount;
      cost.original_currency = currency;

      // ⭐⭐ 关键：ACC 场景下，Grand Total 就是 Payment Total
      if (currency === "USD" && hasExchangeRateHint) {
        cost.payment_total = amount;
        cost.payment_currency = currency;
      }

      continue;
    }


    /* ---------- 基础字段 ---------- */
    if (label.includes("subtotal") && !label.includes("before")) {
      cost.subTotal = amount;
      continue;
    }

		 /* ---------- Shipping（严格限定） ---------- */
    if (
      label.includes("shipping") ||
      label.includes("postage") ||
      label.includes("delivery")
    ) {
      if (
        label.includes("eligible") ||
        label.includes("exchange") ||
        label.includes("fee")
      ) {
        continue;
      }

      cost.shipping = amount;
      continue;
    }

		/* ---------- Tax ---------- */
    if (
      label === "vat:" ||
      label.includes("estimated tax") ||
      label.endsWith(" tax")
    ) {
      cost.tax = amount;
      continue;
    }

    if (label.includes("before") && label.includes("total")) {
      cost.total_before_tax = amount;
      continue;
    }

    /* ---------- Grand Total（关键逻辑） ---------- */
    if (label.includes("grand total")) {
      cost.original_total = amount;
      cost.original_currency = currency;

      // ⭐⭐ 关键：ACC 场景下，Grand Total 就是 Payment Total
      if (currency === "USD") {
        cost.payment_total = amount;
        cost.payment_currency = currency;
      }

      continue;
    }

    /* ---------- 普通 Total fallback ---------- */
    if ((label === "total:" || label.endsWith(" total")) && !cost.original_total) {
      cost.original_total = amount;
      cost.original_currency = currency;
    }
  }

	if (cost.payment_currency === "USD" && cost.payment_total > 0) {
		cost.final_paid_usd = cost.payment_total
	}
	else if (cost.original_currency === "USD") {
		cost.final_paid_usd = cost.original_total
	}
	else if (cost.original_currency !== "USD") {
		cost.final_paid_usd = cost.original_total * cost.exchange_rate
	}
	else {
		cost.final_paid_usd = 0
	}



  /* ---------- original_cost ---------- */
  cost.original_cost =
    cost.original_total ??
    cost.subTotal ??
    0;

  return cost;
}
