// src/order/flow/build-order.ts
import { extractOrderSummary } from "../extract/extract-order-summary";
import { extractOrderCost } from "../extract/extract-order-cost";
import { extractShippingAddress } from "../extract/extract-shipping-address";
import { extractPaymentMethod } from "../extract/extract-payment-method";
import { fetchOrderDetail } from "./fetch-order-detail";
import { buildShipments } from "./build-shipments";
import { normalizeOrderCost } from "@/order/domain/normalize-order-cost";
import { Order } from "@/domain/Order";

export async function buildOrder(
  orderCard: Element,
): Promise<Order> {
  const summary = extractOrderSummary(orderCard);
	console.log(summary)
  const detailDoc = await fetchOrderDetail(orderCard);

	const rawCost = extractOrderCost(detailDoc);
	console.log(rawCost)
	const cost = normalizeOrderCost(rawCost);
	console.log(cost)
  const address = extractShippingAddress(detailDoc);
	console.log(address)
  const paymentMethod = extractPaymentMethod(detailDoc);

	console.log(paymentMethod)
  const shipments = await buildShipments(detailDoc);
	console.log(shipments)
  return {
    ...summary,
    cost,
    address,
    paymentMethod: paymentMethod ?? undefined,
    shipments,
  };
}

