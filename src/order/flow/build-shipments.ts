// src/order/flow/build-shipments.ts
import { buildShipment } from "@/shipment/flow/build-shipment";

const SHIPMENT_SELECTOR = 'div[data-component="shipments"] div.a-box';

export async function buildShipments(
  doc: Document,
) {
  const elems = doc.querySelectorAll(SHIPMENT_SELECTOR);
  const shipments: Record<string, any> = {};

  for (const elem of Array.from(elems)) {
    const shipment = await buildShipment(elem);
    if (shipment?.shipmentId) {
      shipments[shipment.shipmentId] = shipment;
    }
  }

  return shipments;
}

