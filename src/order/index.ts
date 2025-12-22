// src/order/index.ts
import { collectOrdersOnPage } from "./list/order-list";
import { saveOrders } from "./save/save-orders";
import { goToNextPage } from "./list/pagination";
import { isOrdersExpired } from "./domain/is-order-expired";

import { Order } from "@/domain/Order";

export async function syncOrders(user: any) {
  const orders = await collectOrdersOnPage();
	const validOrders = orders.filter(
		(o): o is Order => o !== null,
	);
  await saveOrders(user, validOrders);
	if (
		validOrders.length > 0 &&
		!isOrdersExpired(validOrders)
	) {
		while (true) {
			const moved = await goToNextPage();
			if (!moved) break;
		}

		return false;
	}
}

