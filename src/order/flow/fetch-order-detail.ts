
// src/order/flow/fetch-order-detail.ts
import { fetchInfo } from "@/services/api";
import { getOrderDetailUrl } from "../list/order-selectors";

export async function fetchOrderDetail(
  orderCard: Element | string,
): Promise<Document> {
  const url =
    typeof orderCard === "string"
      ? orderCard
      : getOrderDetailUrl(orderCard);

  return fetchInfo(url);
}

