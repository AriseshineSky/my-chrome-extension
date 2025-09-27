import { describe, it, expect } from "vitest"
import { readFileSync } from "fs"
import { join } from "path"
import { JSDOM } from "jsdom"
import { getOrderCost } from "../content/order-details"

const FIXTURE_DIR = join(__dirname, "html-fixtures")

describe("get order cost from local html", () => {
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
	it("should extract order cost from 205-1272725-0305915.html", async () => {
		const html = readFileSync(join(FIXTURE_DIR, "205-1272725-0305915.html"), "utf-8");
		const dom = new JSDOM(html);
		const result = getOrderCost(dom.window.document.body.textContent.replace(/\s+/g, " ").trim(), "uk");
		console.log(result)
	})
})

