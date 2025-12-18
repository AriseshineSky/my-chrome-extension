// src/order/flow/build-order.ts
import { extractOrderSummary } from "../extract/extract-order-summary";
import { extractOrderCost } from "../extract/extract-order-cost";
import { extractShippingAddress } from "../extract/extract-shipping-address";
import { extractPaymentMethod } from "../extract/extract-payment-method";

import { fetchOrderDetail } from "./fetch-order-detail";
import { buildShipments } from "./build-shipments";

import { Order } from "@/domain/Order";

export async function buildOrder(
  orderCard: Element,
): Promise<Order> {
  const summary = extractOrderSummary(orderCard);
  const detailDoc = await fetchOrderDetail(orderCard);

  const cost = extractOrderCost(detailDoc);
  const address = extractShippingAddress(detailDoc);
  const paymentMethod = extractPaymentMethod(detailDoc);

  const shipments = await buildShipments(detailDoc);

  return {
    ...summary,
    ...cost,
    address,
    paymentMethod,
    shipments,
  };
}

