import { describe, it, expect } from 'vitest'
import { readFileSync } from "fs"
import { join } from "path"
import { JSDOM } from "jsdom"
import { getTrackInfo } from "../content/tracking"

const FIXTURE_DIR = join(__dirname, "html-fixtures")

describe("get order cost from local html", () => {
	it("should extract order cost from UXfxScdLW.html", async () => {
		const html = readFileSync(join(FIXTURE_DIR, "UXfxScdLW.html"), "utf-8")
		const dom = new JSDOM(html)
		const result = getTrackInfo(dom.window.document)
		console.log(result)

		expect(result.tracking).toEqual("UK2959311818")
		expect(result.carrier).toEqual("Amazon")
	})
	it("should extract order cost from k6k.html", async () => {
		const html = readFileSync(join(FIXTURE_DIR, "Ug9qr1K6K.html"), "utf-8")
		const dom = new JSDOM(html)
		const result = getTrackInfo(dom.window.document)
		console.log(result)

		expect(result.tracking).toEqual("UK2943871131")
		expect(result.carrier).toEqual("Amazon")
	})
	it("should extract tracking from BfvmMMzbl.html", async () => {
		const html = readFileSync(join(FIXTURE_DIR, "BfvmMMzbl.html"), "utf-8")
		const dom = new JSDOM(html)
		const result = getTrackInfo(dom.window.document)
		console.log(result)

		expect(result.tracking).toEqual("TBA322745820724")
		expect(result.carrier).toEqual("Amazon")
	})
})
