export function extractShippingAddress(doc: Document): string {
  const container = doc.querySelector('[data-component="shippingAddress"]');
  if (!container) return "";

  return Array.from(container.querySelectorAll("li"))
    .map(li => li.textContent?.trim())
    .filter(Boolean)
    .join(", ");
}

