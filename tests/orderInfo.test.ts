import { describe, it, expect } from "vitest"
import { readFileSync } from "fs"
import { join } from "path"
import { JSDOM } from "jsdom"
import { ORDER_SELECTOR, extractOrderInfo } from "../content/order"

const FIXTURE_DIR = join(__dirname, "html-fixtures")

describe("get order list from local html", () => {
	it("should extract order cost from uk-orders.html", async () => {
		const html = readFileSync(join(FIXTURE_DIR, "uk-orders.html"), "utf-8");
		const dom = new JSDOM(html);
		const result = dom.window.document.querySelectorAll(ORDER_SELECTOR);
		expect(result.length).toBe(35);

		const root = result[0]
		const orderInfo = extractOrderInfo(root);

		expect(orderInfo.totalCost).toBe("£19.95");
		expect(orderInfo.orderDate).toBe("16 December 2025");
		expect(orderInfo.shipTo).toBe("Amber Chiu");
		expect(orderInfo.placedBy).toBe("EMUK2 BUY2");
		expect(orderInfo.orderNumber, '206-2592338-8891513')
	})
})

