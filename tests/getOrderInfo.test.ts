import { describe, it, expect, vi } from "vitest"
import { ORDER_SELECTOR, getOrderInfo } from "../content/order"
import { loadHTML } from "./utils";

vi.mock("../content/orderInfo", () => ({
	fetchInfo: vi.fn(),
}))

vi.mock("../content/shipment", () => ({
  getShipments: vi.fn(async () => {
    return {};
  }),
}));

const EXPECTED_ORDERS = {
  "206-2592338-8891513": {
		orderNumber: '206-2592338-8891513',
		buy_order_number: '206-2592338-8891513',
		buy_order_date: '2025-12-16',
		ship_to: 'Amber Chiu',
		subTotal: 16.62,
		tax: 3.32,
		shipping: 0,
		original_currency: 'GBP',
		original_cost: 19.94,
		usd_cost: 19.94,
		exchange_rate: 1,
		address: 'Amber Chiu, BIRD IN EYE FARMHOUSE BIRD IN EYE HILL8773969FRAMFIELD TN22 5HA, United Kingdom',
		paymentMethod: 'Visa •••• 9618'
  },
}

describe("get order list from local html", () => {
	it("should extract order cost from uk-orders.html", async () => {
		const file = "uk-orders.html"
		const document = loadHTML(file);
		const orderNumber = "206-2592338-8891513";
		const expect_order = EXPECTED_ORDERS[orderNumber];

		const divOrders = document.querySelectorAll(ORDER_SELECTOR)
		const targetOrder = Array.from(divOrders).find(div =>
			div.textContent?.includes(orderNumber)
		);

		expect(targetOrder).toBeDefined();
		const localFetch = async (url: string) => {
			const match = url.match(/orderID=([\d-]+)/);
			if (!match) throw new Error("invalid url");
			return loadHTML(`${match[1]}.html`);
		};

		const order = await getOrderInfo(
			targetOrder!,
			"uk",
			localFetch
		);
		expect(order.original_currency).toBe(expect_order.original_currency);
		expect(order.paymentMethod).toBe(expect_order.paymentMethod);
	})
})

