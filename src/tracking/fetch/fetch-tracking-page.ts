import { fetchInfo } from "../../services/api";
import { TRACK_LINK_SELECTOR } from "../selectors";

export async function fetchTrackingPage(
  shipmentElem: Element,
): Promise<Document | null> {
  const links = shipmentElem.querySelectorAll(TRACK_LINK_SELECTOR);

  for (const link of Array.from(links)) {
    const text = link.textContent ?? "";

    if (
      text.includes("Track package") ||
      text.includes("Lieferung verfolgen")
    ) {
      const href = link.getAttribute("href");
      if (!href) continue;

      return fetchInfo(href);
    }
  }

  return null;
}

