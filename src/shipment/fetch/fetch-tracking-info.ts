import { fetchTrackInfo } from "../../tracking";

export async function fetchTrackingInfo(
  shipmentElem: Element,
) {
  return fetchTrackInfo(shipmentElem);
}

