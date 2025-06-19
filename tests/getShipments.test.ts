vi.mock('../content/tracking', () => ({
	fetchTrackInfo: vi.fn().mockResolvedValue({
		tracking: "MOCKTRACKING",
		carrier: "MOCKCARRIER"
	})
}));
import { getShipments } from '../content/shipment';
import { readFileSync } from 'fs'
import { join } from 'path'
import { JSDOM } from 'jsdom'
import { describe, it, expect, vi } from 'vitest'


const FIXTURE_DIR = join(__dirname, 'html-fixtures')

describe('getShipments from local HTML', () => {
	// it('should extract shipments from 112-3905152-4244227.html', async () => {
	// 	const html = readFileSync(join(FIXTURE_DIR, '112-3905152-4244227.html'), 'utf-8')
	// 	const dom = new JSDOM(html)
	// 	const result = await getShipments(dom.window.document)
	//
	// 	console.log('Extracted address:', result)
	// 	// expect(result).toMatch(/.+/)
	// })

	it('should extract shipments from 112-5975653-8865058.html', async () => {
		const html = readFileSync(join(FIXTURE_DIR, '112-5975653-8865058.html'), 'utf-8')
		const dom = new JSDOM(html)
		const result = await getShipments(dom.window.document, 'US', 1)

		const targetShipments = {
			B7V90j3gd: {
				shipmentId: 'B7V90j3gd',
				orderItems: { "B0BYYMQNQV": { asin: 'B0BYYMQNQV', cost: 25.98, quantity: 1 } },
				shipmentStatus: 'Arriving tomorrow',
				trackingInfo: { tracking: 'MOCKTRACKING', carrier: 'MOCKCARRIER' }
			}
		}

		expect(JSON.stringify(result, null, 2)).toEqual(JSON.stringify(targetShipments, null, 2))
	})
})
