import {
  TRACK_NUMBER_SELECTOR,
  CARRIER_SELECTOR,
} from "../selectors";
import { extractTrackInfoFromText } from "./extract-track-text";
import { TrackingInfo } from "../../domain/Tracking";

export function extractTrackInfo(doc: Document): TrackingInfo {
  const trackNoStr =
    doc.querySelector(TRACK_NUMBER_SELECTOR)?.textContent ?? null;

  const carrierStr =
    doc.querySelector(CARRIER_SELECTOR)?.textContent ?? null;

  return extractTrackInfoFromText(trackNoStr, carrierStr);
}

