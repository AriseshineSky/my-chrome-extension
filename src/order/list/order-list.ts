// src/order/list/order-list.ts
import { buildOrder } from "../flow/build-order";
import { ORDER_SELECTOR } from "./order-selectors";

export async function collectOrdersOnPage() {
  const cards = document.querySelectorAll(ORDER_SELECTOR);

	console.log(cards)

  const orders = await Promise.all(
    Array.from(cards).map(card =>
      buildOrder(card).catch(() => null),
    ),
  );

  return orders.filter(Boolean);
}

