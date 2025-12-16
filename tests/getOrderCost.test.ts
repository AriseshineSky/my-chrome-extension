import { describe, it, expect } from "vitest"
import { getOrderCost } from "../content/order-details"
import { loadHTML } from "./utils";

describe("getOrderCost", () => {
	it("should extract order cost from 206-2592338-8891513.html", async () => {
		const doc = loadHTML("206-2592338-8891513.html");
    const cost = getOrderCost(doc);

    expect(cost).toHaveProperty("subTotal");
    expect(cost).toHaveProperty("tax");
    expect(cost).toHaveProperty("shipping");
    expect(cost).toHaveProperty("total");
    expect(cost.original_currency).toMatch(/USD|GBP|EUR/);
    expect(cost.original_cost).toBeGreaterThan(0);
		const targetCost = { subTotal: 16.62, shipping: 0, tax: 3.32, total: 19.94 }

    expect(cost.original_currency).toBe("GBP");
    expect(cost.subTotal).toBe(targetCost.subTotal);
    expect(cost.shipping).toBe(targetCost.shipping);
    expect(cost.tax).toBe(targetCost.tax);
    expect(cost.total).toBe(targetCost.total);
	})
	// it("should extract order cost from 202-9691085-8778754.html", async () => {
	// 	const html = readFileSync(join(FIXTURE_DIR, "202-9691085-8778754.html"), "utf-8")
	// 	const dom = new JSDOM(html)
	// 	const result = getOrderCost(dom.window.document.body.textContent.replace(/\s+/g, " ").trim(), 'uk')
	// 	expect(result.buy_cost).toEqual(7.58)
	// 	expect(result.subTotal).toEqual(7.58)
	// 	expect(result.buy_tax).toEqual(0)
	// 	expect(result.buy_shipping_fee).toEqual(0)
	// 	expect(result.rate).toEqual(1.38)
	// 	expect(result.total).toEqual(7.58)
	// 	expect(result.taxTotal).toEqual(0)
	// 	expect(result.paymentTotal).toEqual(7.56)
	// })
	// it("should extract order cost from 202-6344826-2669928.html", async () => {
	// 	const html = readFileSync(join(FIXTURE_DIR, "202-6344826-2669928.html"), "utf-8")
	// 	const dom = new JSDOM(html)
	// 	const result = getOrderCost(dom.window.document.body.textContent.replace(/\s+/g, " ").trim(), 'uk')
	// 	expect(result.buy_cost).toEqual(114.81)
	// 	expect(result.subTotal).toEqual(114.81)
	// 	expect(result.buy_tax).toEqual(19.13)
	// 	expect(result.buy_shipping_fee).toEqual(0)
	// 	expect(result.rate).toEqual(1.37)
	// 	expect(result.total).toEqual(114.81)
	// 	expect(result.taxTotal).toEqual(19.13)
	// 	expect(result.paymentTotal).toEqual(114.92)
	// })
	// it("should extract order cost from 112-6514990-7723409.html", async () => {
	// 	const html = readFileSync(join(FIXTURE_DIR, "112-6514990-7723409.html"), "utf-8");
	// 	const dom = new JSDOM(html);
	// 	const result = getOrderCost(dom.window.document.body.textContent.replace(/\s+/g, " ").trim(), "us");
	// 	console.log(result)
	// })

	// it("should extract order cost from 205-1272725-0305915.html", async () => {
	// 	const html = readFileSync(join(FIXTURE_DIR, "205-1272725-0305915.html"), "utf-8");
	// 	const dom = new JSDOM(html);
	// 	const result = getOrderCost(dom.window.document.body.textContent.replace(/\s+/g, " ").trim(), "uk");
	// 	console.log(result)
	// })
})

