import { fetchInfo } from "../services/api";

const TRACK_ELEMENT_SELECTOR =
  ':scope div[data-component="shipmentConnections"] a, :scope span.track-package-button a';

const TRACK_NUMBER_SELECTOR = "div.pt-delivery-card-trackingId";
const CARRIER_SELECTOR = "h3.a-spacing-small";

function getTrackElements(doc: Document) {
  const trackNoStr = doc.querySelector(TRACK_NUMBER_SELECTOR)?.textContent ?? null;
  const carrierStr = doc.querySelector(CARRIER_SELECTOR)?.textContent ?? null;
  return { trackNoStr, carrierStr };
}

export function getTrackInfo(doc: Document) {
  const { trackNoStr, carrierStr } = getTrackElements(doc);
  return getTrackInfoFromText(trackNoStr, carrierStr);
}

function getTrackInfoFromText(trackNoStr: string | null, carrierStr: string | null) {
  let tracking: string | null = null;
  let carrier: string | null = null;

  if (trackNoStr) {
    const match = trackNoStr.match(/Tracking\s*ID:\s*(\S+)/i);
    tracking = match ? match[1] : null;
  }

  if (carrierStr) {
    const text = carrierStr.trim();
    if (/amazon/i.test(text)) {
      carrier = "Amazon";
    } else if (/shipped with/i.test(text)) {
      carrier = text.replace(/shipped with/i, "").trim();
    } else if (/delivery by/i.test(text)) {
      carrier = text.replace(/delivery by/i, "").trim();
    } else {
      carrier = text;
    }
  }

  return { tracking, carrier };
}

export async function fetchTrackInfo(delivBox: Element) {
  const links = delivBox.querySelectorAll(TRACK_ELEMENT_SELECTOR);

  for (const link of links) {
    const text = link.textContent ?? "";
    if (text.includes("Track package") || text.includes("Lieferung verfolgen")) {
      const href = link.getAttribute("href");
      if (!href) continue;

      const trackDoc = await fetchInfo(href);
      return getTrackInfo(trackDoc);
    }
  }

  return {
    tracking: null,
    carrier: null,
  };
}

