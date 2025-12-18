import { SHIPMENT_STATUS_SELECTOR } from "../selectors";

export function extractShipmentStatus(shipmentElem: Element): string {
  return (
    shipmentElem
      .querySelector(SHIPMENT_STATUS_SELECTOR)
      ?.textContent?.trim() ?? ""
  );
}

