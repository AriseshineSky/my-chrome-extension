import { describe, it, expect, vi, beforeEach } from 'vitest'
import { JSDOM } from 'jsdom'
import { readFileSync } from 'fs'
import { join } from 'path'
import { fetchTrackInfo } from '../content/tracking'
import { SHIPMENTS_SELECTOR } from '../content/shipment'

describe('fetchTrackInfo()', () => {
	let html: string
	let doc: Document


	it('should call fetch with correct href and parse HTML', async () => {
		html = readFileSync(join(__dirname, 'html-fixtures/202-2103857-5887544.html'), 'utf-8')
		const jsdom = new JSDOM(html)
		doc = jsdom.window.document
		// Mock fetch 返回你本地 HTML 内容
		global.fetch = vi.fn().mockResolvedValue({
			ok: true,
			text: () => Promise.resolve(html),
		})

		const shipmentElems = doc.querySelectorAll(SHIPMENTS_SELECTOR)
		for (let shipmentElem of shipmentElems) {

			if (!shipmentElem.innerHTML?.trim()) {
				continue
			}

			const result = await fetchTrackInfo(shipmentElem)
		}

		expect(global.fetch).toHaveBeenCalledWith(
			'/progress-tracker/package/ref=ppx_od_dt_b_track_package?_encoding=UTF8&itemId=ngrklsnpmplqqo&orderId=202-2103857-5887544&packageIndex=0&shipmentId=UXfxScdLW&vt=ORDER_DETAILS',
			expect.objectContaining({ credentials: 'include' })
		)

	})
	it('should call fetch with correct href and parse 1519 HTML', async () => {
		html = readFileSync(join(__dirname, 'html-fixtures/205-2462098-0251519.html'), 'utf-8')
		const jsdom = new JSDOM(html)
		doc = jsdom.window.document
		global.fetch = vi.fn().mockResolvedValue({
			ok: true,
			text: () => Promise.resolve(html),
		})

		const shipmentElems = doc.querySelectorAll(SHIPMENTS_SELECTOR)
		for (let shipmentElem of shipmentElems) {

			if (!shipmentElem.innerHTML?.trim()) {
				continue
			}

			const result = await fetchTrackInfo(shipmentElem)
		}

		expect(global.fetch).toHaveBeenCalledWith(
			'/progress-tracker/package/ref=ppx_od_dt_b_track_package?_encoding=UTF8&itemId=ngplssqppolwqo&orderId=205-2462098-0251519&packageIndex=0&shipmentId=Ug9qr1K6K&vt=ORDER_DETAILS',
			expect.objectContaining({ credentials: 'include' })
		)

	})
})

