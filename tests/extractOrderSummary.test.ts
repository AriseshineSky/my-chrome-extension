import { readFileSync, writeFileSync } from 'fs';
import { describe, it, expect } from 'vitest';
import { JSDOM, ResourceLoader } from 'jsdom';
import { extractOrderSummary } from '../content/order-details'
import { join } from "path"

const FIXTURE_DIR = join(__dirname, 'html-fixtures')

describe('extractOrderSummary', () => {
	it('parses amazon order summary correctly', () => {
		const html = readFileSync(join(FIXTURE_DIR, "112-6514990-7723409.html"), "utf-8");
		const dom = new JSDOM(html);

		const result = extractOrderSummary(dom.window.document.body.textContent.replace(/\s+/g, " ").trim(), "us");
		console.log(result)
	})
})
