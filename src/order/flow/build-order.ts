// src/order/flow/build-order.ts
import { extractOrderSummary } from "../extract/extract-order-summary";
import { extractOrderCost } from "../extract/extract-order-cost";
import { extractOrderAddress } from "../extract/extract-order-address";
import { extractPaymentMethod } from "../extract/extract-payment-method";

import { fetchOrderDetail } from "./fetch-order-detail";
import { buildShipments } from "./build-shipments";

import { Order } from "../types/Order";

export async function buildOrder(
  orderCard: Element,
): Promise<Order> {
  // 1️⃣ 列表页
  const summary = extractOrderSummary(orderCard);
  // { orderNumber, orderDate, shipTo, detailUrl }

  // 2️⃣ 详情页
  const detailDoc = await fetchOrderDetail(summary.detailUrl);

  // 3️⃣ 订单级信息
  const cost = extractOrderCost(detailDoc);
  const address = extractOrderAddress(detailDoc);
  const paymentMethod = extractPaymentMethod(detailDoc);

  // 4️⃣ 物流
  const shipments = await buildShipments(detailDoc);

  // 5️⃣ 拼装
  return {
    ...summary,
    ...cost,
    address,
    paymentMethod,
    shipments,
  };
}

