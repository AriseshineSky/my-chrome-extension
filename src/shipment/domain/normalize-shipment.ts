// src/order/domain/normalize-order-cost.ts

function normalizeShipmentItem(raw: Record<string, any>) {
  return {
    asin: raw.asin,
    quantity: raw.quantity ?? 1,
    price: raw.originalCost ?? 0,
    currency: raw.originalCurrency ?? null,
  };
}


export function normalizeShipment(
  raw: Record<string, any>
) {
  return {
    shipment_id: raw.shipmentId ?? null,
    status: raw.status ?? null,

    tracking: raw.tracking?.tracking ?? null,
    carrier: raw.tracking?.carrier ?? null,
		items: Object.values(raw.items ?? {} as Record<string, any>)
		  .map(item => normalizeShipmentItem(item as Record<string, any>))

  };
}

