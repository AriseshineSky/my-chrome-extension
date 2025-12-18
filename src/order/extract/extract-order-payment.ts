// src/order/extract/extract-payment-method.ts
export function extractPaymentMethod(doc: Document): string | null {
  const text =
    doc.querySelector('[data-component="viewPaymentPlanSummaryWidget"]')
      ?.textContent?.replace(/\s+/g, " ")
      .trim();

  return text || null;
}

