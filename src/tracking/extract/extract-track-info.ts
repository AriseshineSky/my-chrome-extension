import {
  TRACK_NUMBER_SELECTOR,
  CARRIER_SELECTOR,
  TRACK_LINK_SELECTOR,
} from "../selectors";
import { extractTrackInfoFromText } from "./extract-track-text";
import { TrackingInfo } from "../../domain/Tracking";

export function extractTrackInfo(doc: Document): TrackingInfo {
	const trackLink = doc.querySelector(TRACK_LINK_SELECTOR) as HTMLAnchorElement | null;
	if (trackLink) {
    const linkText = trackLink.textContent?.trim() ?? null;
    const href = trackLink.href ?? null;

    return extractTrackInfoFromText(
      linkText || href,
      href
    );
  }

  const trackNoStr =
    doc.querySelector(TRACK_NUMBER_SELECTOR)?.textContent ?? null;

  const carrierStr =
    doc.querySelector(CARRIER_SELECTOR)?.textContent ?? null;

  const normalizedCarrier = carrierStr?.trim() ?? null;
  const carrierCandidate =
    normalizedCarrier && /^delivery info$/i.test(normalizedCarrier)
      ? null
      : normalizedCarrier;

  return extractTrackInfoFromText(trackNoStr, carrierCandidate);
}
