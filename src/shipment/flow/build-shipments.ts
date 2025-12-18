import { buildShipment } from "./build-shipment";

export async function buildShipments(
  doc: Document,
) {
  const elems = doc.querySelectorAll('div[data-component="shipments"] div.a-box');
  const shipments: Record<string, any> = {};

  for (const elem of Array.from(elems)) {
    const shipment = await buildShipment(elem);
    if (shipment?.shipmentId) {
      shipments[shipment.shipmentId] = shipment;
    }
  }

  return shipments;
}

