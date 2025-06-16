import { getShippingAddress } from '../content/order-details';
import { readFileSync } from 'fs'
import { join } from 'path'
import { JSDOM } from 'jsdom'
import { describe, it, expect } from 'vitest'

const FIXTURE_DIR = join(__dirname, 'html-fixtures')

describe('getShippingAddress from local HTML', () => {
	it('should extract address from 111.html', () => {
		const html = readFileSync(join(FIXTURE_DIR, '113-7980148-9917858.html'), 'utf-8')
		const dom = new JSDOM(html)
		const result = getShippingAddress(dom.window.document)

		console.log('Extracted address:', result)
		expect(result).toMatch(/.+/)
	})
})
describe('getShippingAddress from local HTML', () => {
	it('should extract address from 111.html', () => {
		const html = readFileSync(join(FIXTURE_DIR, '113-9672161-1279446.html'), 'utf-8')
		const dom = new JSDOM(html)
		const result = getShippingAddress(dom.window.document)

		console.log('Extracted address:', result)
		expect(result).toMatch(/.+/)
	})
})

describe('getShippingAddress from local HTML', () => {
	it('should extract address from 111.html', () => {
		const html = readFileSync(join(FIXTURE_DIR, '111-6784099-6345037.html'), 'utf-8')
		const dom = new JSDOM(html)
		const result = getShippingAddress(dom.window.document)

		console.log('Extracted address:', result)
		expect(result).toMatch(/.+/)
	})
})


