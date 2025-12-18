import { describe, it, expect } from "vitest"
import { ORDER_SELECTOR, extractOrderInfo } from "../content/order"
import { loadHTML } from "./utils";

const EXPECTED_ORDERS = {
  "206-2592338-8891513": {
		orderNumber: '206-2592338-8891513',
		orderDate: '16 December 2025',
		totalCost: '£19.95',
		shipTo: 'Amber Chiu',
		placedBy: 'EMUK2 BUY2'
  },
  "206-1406265-9918723": {
		orderNumber: '206-1406265-9918723',
		orderDate: '16 December 2025',
		totalCost: '£21.98',
		shipTo: 'Amber Chiu',
		placedBy: 'EMUK2 BUY2'
  }
}

describe("get order basic info from local html", () => {
	it("should extract order cost from uk-orders.html", async () => {
		const file = "uk-orders.html"
		const orders = {}
		const document = loadHTML(file);

		const divOrders = document.querySelectorAll(ORDER_SELECTOR)
		for (const divOrder of divOrders) {
			try {
				const order = extractOrderInfo(divOrder);
				if (!order.orderNumber) {
					continue
				}
				orders[order.orderNumber] = order
			} catch (e) {
				console.log(e)
			}
		}
		for (const [orderNumber, order] of Object.entries(EXPECTED_ORDERS)) {
			const orderInfo = orders[orderNumber]
			console.log(orderInfo)
			expect(orderInfo.totalCost).toBe("£19.95");
			expect(orderInfo.orderDate).toBe("16 December 2025");
			expect(orderInfo.shipTo).toBe("Amber Chiu");
			expect(orderInfo.placedBy).toBe("EMUK2 BUY2");
			expect(orderInfo.orderNumber, '206-2592338-8891513')
		}
	})
})

