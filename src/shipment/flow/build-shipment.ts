import { extractShipmentId } from "../extract/extract-shipment-id";
import { extractShipmentStatus } from "../extract/extract-shipment-status";
import { extractOrderItems } from "../extract/extract-order-items";
import { buildTracking } from "../../tracking/flow/build-tracking";

export async function buildShipment(
  shipmentElem: Element,
) {
  const shipmentId = extractShipmentId(shipmentElem);
  if (!shipmentId) return null;

  const status = extractShipmentStatus(shipmentElem);
  const items = extractOrderItems(shipmentElem);
  const tracking = await buildTracking(shipmentElem);

  return {
    shipmentId,
    status,
    items,
    tracking,
  };
}

