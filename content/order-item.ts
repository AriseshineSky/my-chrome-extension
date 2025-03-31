const SHIPMENTS_SELECTOR = 'div[data-component="shipments"] div.a-box'
const SHIPMENT_STATUS_SELECTOR = ':scope div.js-shipment-info-container div.a-row:nth-of-type(1) span, :scope div#shipment-top-row h4'
const ORDER_ITEM_SELECTOR = ':scope div.a-fixed-left-grid'
const URL_SELECTOR = ':scope div.yohtmlc-item a, div[data-component="itemTitle"] a'
const PRICE_SELECTOR = ':scope span.a-color-price, div[data-component="unitPrice"] > span > span.a-offscreen'
const QUANTITY_SELECTOR = ':scope div.od-item-view-qty'
import { fetchTrackInfo } from './tracking'

export async function getShipments(doc) {
	const shipmentElems = doc.querySelectorAll(SHIPMENTS_SELECTOR)
	let shipments = [];
	for (let shipmentElem of shipmentElems) {
		if (!shipmentElem.innerHTML?.trim()) {
			continue
		}
		shipments.push(await getShipment(shipmentElem))
	}
	return shipments;
}

async function getShipment(shipmentElem) {
	const orderItems = getOrderItems(shipmentElem)
	const shipmentStatus = shipmentElem.querySelector(SHIPMENT_STATUS_SELECTOR)?.textContent?.trim()
	const trackingInfo = await fetchTrackInfo(shipmentElem)
	return { orderItems, shipmentStatus, trackingInfo }
}
function getOrderItems(shipmentElem) {
	const orderItemElems = shipmentElem.querySelectorAll(ORDER_ITEM_SELECTOR)
	let orderItems = []
	for (let orderItemElem of orderItemElems) {
		orderItems.push(getOrderItemFromElem(orderItemElem, 1))
	}
	return orderItems;
}

function getAsinFromUrl(url) {
	let asin = null

	let asinMatch1 = url.match(/\/dp\/(\w+)/)
	let asinMatch2 = url.match(/\/gp\/product\/(\w+)/)
	if (asinMatch1) {
		asin = asinMatch1[1]
	} else if (asinMatch2) {
		asin = asinMatch2[1]
	}

	return asin
}

function getOrderItemFromElem(orderItemElem, rate) {
	const item = orderItemElem.querySelector(URL_SELECTOR)
	const itemUrl = item?.getAttribute('href')
	if (!itemUrl) {
		return null;
	}
	const asin = getAsinFromUrl(itemUrl)
	const price = Number(orderItemElem.querySelector(PRICE_SELECTOR)?.textContent.trim().replace(",", ".").replace(/[^\d.]/g, ''))
	let quantity = 1
	let quantSel = orderItemElem.querySelector(QUANTITY_SELECTOR)
	if (quantSel) {
		quantity = Number(quantSel.textContent?.trim())
	}
	const cost = quantity * price

	return {
		asin,
		"cost": Number((cost / rate).toFixed(2)),
		quantity,
	}
}
