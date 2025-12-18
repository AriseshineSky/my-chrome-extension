import { SHIPMENT_LINK_SELECTOR } from "../selectors";

function getShipmentIdFromUrl(url: string): string | null {
  try {
    const fullUrl = new URL(
      url,
      typeof window !== "undefined" ? window.location.origin : "http://localhost",
    );
    return new URLSearchParams(fullUrl.search).get("shipmentId");
  } catch {
    return null;
  }
}

export function extractShipmentId(shipmentElem: Element): string | null {
  const links = shipmentElem.querySelectorAll(SHIPMENT_LINK_SELECTOR);

  for (const link of Array.from(links)) {
    const href = link.getAttribute("href");
    if (!href) continue;

    const id = getShipmentIdFromUrl(href);
    if (id) return id;
  }

  return null;
}

