// src/persistence/to-order-record.ts
import { Order } from "@/domain/Order";

export function toOrderRecord(
  order: Order,
  userEmail: string,
) {
  const cost = order.cost;

  return {
    user_email: userEmail,

    order_number: order.orderNumber,
    buy_order_date: order.buyOrderDate ?? null,
    ship_to: order.shipTo ?? null,

    address: order.address ?? null,
    payment_method: order.paymentMethod ?? null,

    sub_total: cost.subTotal ?? 0,
    shipping: cost.shipping ?? 0,
    tax: cost.tax ?? 0,

    original_currency: cost.original_currency,
    original_cost: cost.original_cost,

    usd_cost: cost.usd_cost,
    final_paid_usd: cost.final_paid_usd ?? cost.usd_cost,

    exchange_rate: cost.exchange_rate,

    // ✅ optional fields：不存在就不传
    payment_currency: cost.payment_currency,
    payment_total: cost.payment_total,

    shipments: order.shipments,
  };
}

