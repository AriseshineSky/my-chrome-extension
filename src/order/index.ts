// src/order/index.ts

import { collectOrdersOnPage } from "./list/order-list";
import { saveOrders } from "./save/save-orders";
import { goToNextPage } from "./list/pagination";
import { isOrdersExpired } from "./domain/is-order-expired";

import { Order } from "@/domain/Order";

export async function syncOrders(user: any,  context: { domain?: string }) {
	while (true) {
		console.log("new page")
		const orders = await collectOrdersOnPage();
		const validOrders = orders.filter(
			(o): o is Order => o !== null,
		);
		await saveOrders(user, validOrders, context);
		if (
			validOrders.length > 0 &&
			!isOrdersExpired(validOrders)
		) {
			await goToNextPage();
		} else {
			return true;
		}
	}
}

