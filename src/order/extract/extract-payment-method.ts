const BRAND_MAP: Record<string, string> = {
  "American Express": "AMEX",
	"AmericanExpress": "AMEX",
  "Amex": "AMEX",
  "Visa": "Visa",
  "MasterCard": "MasterCard",
  "Mastercard": "MasterCard",
};

function normalizeBrand(raw?: string | null): string | null {
  if (!raw) return null;
  return BRAND_MAP[raw] ?? raw;
}

export function extractPaymentMethod(doc: Document): string | null {
  const item = doc.querySelector(
    '[data-component="viewPaymentPlanSummaryWidget"] li.pmts-payments-instrument-detail-box-paystationpaymentmethod'
  );

  if (item) {
    // AMEX / Visa / MasterCard
		const rawBrand = item
			.querySelector("img")
			?.getAttribute("alt")
			?.trim();

		const brand = normalizeBrand(rawBrand);


    // ending in 2085
    const tail = item
      .querySelector(".a-color-base")
      ?.textContent
      ?.trim();

    if (brand && tail) {
      return `${brand} ${tail}`;
    }

    // fallback（极少数页面）
    const text = item.textContent?.replace(/\s+/g, " ").trim();
    if (text) return text;
  }

	/* ---------------- 2️⃣ CA React 结构 ---------------- */

  const caBrand = doc
    .querySelector('[data-testid="method-details-name"]')
    ?.textContent
    ?.trim();

  const caLast4 = doc
    .querySelector('[data-testid="method-details-number"]')
    ?.textContent
    ?.trim();

  if (caBrand || caLast4) {
    const brand = normalizeBrand(caBrand);
    return [brand, caLast4 ? `ending in ${caLast4}` : null]
      .filter(Boolean)
      .join(" ");
  }

  /* ---------------- 3 Next.js (__NEXT_DATA__) ---------------- */

  const next = doc.querySelector("#__NEXT_DATA__");
  if (next?.textContent) {
    try {
      const data = JSON.parse(next.textContent);

      const list =
        data?.props?.pageProps?.applicationData
          ?.getSelectedPaymentMethodsResponse
          ?.displayResponse
          ?.paymentMethodInstrumentDisplayList
          ?.paymentMethodInstrumentDisplayDatumList;

      if (Array.isArray(list) && list.length > 0) {
        const core = list[0].paymentMethodDisplayDatumCore;
        const brand = core?.paymentMethodHeader;
        const last4 = core?.paymentMethodNumber?.lastDigits;

        if (brand || last4) {
          return [brand, last4 ? `ending in ${last4}` : null]
            .filter(Boolean)
            .join(" ");
        }
      }
    } catch {
      // ignore
    }
  }

  const paymentWidgetText = doc
    .querySelector('[data-component="viewPaymentPlanSummaryWidget"]')
    ?.textContent
    ?.replace(/\s+/g, " ")
    .trim();

  if (paymentWidgetText) {
    const cardMatch = paymentWidgetText.match(
      /(American\s*Express|AmericanExpress|Amex|Visa|Master\s*Card|Mastercard)\s*[•*]{2,}\s*(\d{4})/i,
    );

    if (cardMatch) {
      const brand = normalizeBrand(cardMatch[1]);
      const last4 = cardMatch[2];
      if (brand && last4) {
        return `${brand} ending in ${last4}`;
      }
    }
  }

  return null;
}
