// src/order/index.ts
import { collectOrdersOnPage } from "./list/order-list";
import { saveOrders } from "./save/save-orders";
import { goToNextPage } from "./list/pagination";
import {  isOrdersExpired } from "./domain/is-order-expired";

export async function syncOrders(user) {
  const orders = await collectOrdersOnPage();
  await saveOrders(user, orders);

  if (!isOrdersExpired(orders)) {
    goToNextPage();
    return false;
  }
  return true;
}

