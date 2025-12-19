// src/order/domain/normalize-order-cost.ts
import { OrderItem } from "@/domain/OrderItem";

export function normalizeOrderItem(raw: OrderItem) {
	return {
		original_cost: raw.originalCost,
		original_currency: raw.originalCurrency,
		asin: raw.asin,
		quantity: raw.quantity,
	}
}

