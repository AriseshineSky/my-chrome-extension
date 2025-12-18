import { fetchTrackingPage } from "../fetch/fetch-tracking-page";
import { extractTrackInfo } from "../extract/extract-track-info";
import { TrackingInfo } from "../../domain/Tracking";

export async function buildTracking(
  shipmentElem: Element,
): Promise<TrackingInfo> {
  const doc = await fetchTrackingPage(shipmentElem);

  if (!doc) {
    return { tracking: null, carrier: null };
  }

  return extractTrackInfo(doc);
}

