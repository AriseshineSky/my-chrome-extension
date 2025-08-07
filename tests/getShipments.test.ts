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

	it('should extract shipments from 202-2103857-5887544.html', async () => {
		const html = readFileSync(join(FIXTURE_DIR, '202-2103857-5887544.html'), 'utf-8')
		const dom = new JSDOM(html)
		const result = await getShipments(dom.window.document, 'UK', null)

		const targetShipments = {
			UXfxScdLW: {
				shipmentId: 'UXfxScdLW',
				orderItems: { "B012A8RF3O": { asin: 'B012A8RF3O', cost: 21.92, quantity: 1 } },
				shipmentStatus: 'Delivered today',
				trackingInfo: { tracking: 'MOCKTRACKING', carrier: 'MOCKCARRIER' }
			}
		}

		expect(JSON.stringify(result, null, 2)).toEqual(JSON.stringify(targetShipments, null, 2))
	})

	it('should extract shipments from 114-9055699-7667464.html', async () => {
		const html = readFileSync(join(FIXTURE_DIR, '114-9055699-7667464.html'), 'utf-8')
		const dom = new JSDOM(html)
		const result = await getShipments(dom.window.document, 'US', null)
		console.log(result)

		const targetShipments = {
			UXfxScdLW: {
				shipmentId: 'UXfxScdLW',
				orderItems: { "B012A8RF3O": { asin: 'B012A8RF3O', cost: 21.92, quantity: 1 } },
				shipmentStatus: 'Delivered today',
				trackingInfo: { tracking: 'MOCKTRACKING', carrier: 'MOCKCARRIER' }
			}
		}

		expect(JSON.stringify(result, null, 2)).toEqual(JSON.stringify(targetShipments, null, 2))
	})
})
