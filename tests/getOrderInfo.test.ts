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
		usd_cost: 26.72,
		exchange_rate: 1.34,
		address: 'Amber Chiu, BIRD IN EYE FARMHOUSE BIRD IN EYE HILL8773969FRAMFIELD TN22 5HA, United Kingdom',
		paymentMethod: 'Visa •••• 9618'
  },
  "702-0137443-3750617": {
		orderNumber: '702-0137443-3750617',
		buy_order_number: '702-0137443-3750617',
		buy_order_date: '2026-01-15',
		ship_to: 'Honghao Lu',
		subTotal: 16.62,
		tax: 3.32,
		shipping: 0,
		original_currency: 'GBP',
		original_cost: 19.94,
		usd_cost: 208.35,
		exchange_rate: 1.34,
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
			localFetch
		);
		expect(order.original_currency).toBe(expect_order.original_currency);
		expect(order.original_cost).toBe(expect_order.original_cost);
		expect(order.usd_cost).toBe(expect_order.usd_cost);
		expect(order.exchange_rate).toBe(expect_order.exchange_rate);
		expect(order.address).toBe(expect_order.address);
		expect(order.buy_order_date).toBe(expect_order.buy_order_date);
		expect(order.buy_order_number).toBe(expect_order.buy_order_number);
	})

	it("should extract order cost from uk-orders.html", async () => {
		const file = "mx-orders.html"
		const document = loadHTML(file);
		const orderNumber = "702-0137443-3750617";
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
			localFetch
		);
		expect(order.original_currency).toBe(expect_order.original_currency);
		expect(order.original_cost).toBe(expect_order.original_cost);
		expect(order.usd_cost).toBe(expect_order.usd_cost);
		expect(order.exchange_rate).toBe(expect_order.exchange_rate);
		expect(order.address).toBe(expect_order.address);
		expect(order.buy_order_date).toBe(expect_order.buy_order_date);
		expect(order.buy_order_number).toBe(expect_order.buy_order_number);
	})
})

