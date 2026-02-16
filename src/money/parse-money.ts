import { inferCurrencyFromContext } from "@/domain/currency/infer-currency";

const SYMBOL_TO_CURRENCY: Record<string, string> = {
  "$": "USD",
  "£": "GBP",
  "€": "EUR",
};

export function parseMoney(text: string, context: { domain?: string }): {
  amount: number;
  currency: string | null;
} {
  if (!text) return { amount: NaN, currency: null };

  const clean = text.replace(/\s+/g, " ").trim();

  const iso = clean.match(/^([A-Z]{3})\s*([\d,.]+)/);
  if (iso) {
    return {
      currency: iso[1],
      amount: Number(iso[2].replace(/,/g, "")),
    };
  }

  const symbol = clean.match(/^([$£€])\s*([\d,.]+)/);

  if (symbol) {
    return {
      currency: inferCurrencyFromContext(symbol[1], context),
      amount: Number(symbol[2].replace(/,/g, "")),
    };
  }

  const negative = clean.match(/^-\s*([$£€])\s*([\d,.]+)/);
  if (negative) {
    return {
      currency: SYMBOL_TO_CURRENCY[negative[1]] ?? null,
      amount: -Number(negative[2].replace(/,/g, "")),
    };
  }

  return { amount: NaN, currency: null };
}

