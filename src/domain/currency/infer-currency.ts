export function inferCurrencyFromContext(
  symbol: string | null,
  context: { domain?: string }
): string | null {
  if (!symbol) return null;

  if (symbol === "$") {
    if (context.domain?.endsWith(".com.mx")) return "MXN";
    if (context.domain?.endsWith(".com")) return "USD";
    if (context.domain?.endsWith(".ca")) return "CAD";
    if (context.domain?.endsWith(".com.au")) return "AUD";
  }

  if (symbol === "€") return "EUR";
  if (symbol === "£") return "GBP";

  return null;
}

