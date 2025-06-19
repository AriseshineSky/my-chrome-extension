const ORDER_ITEM_SELECTOR = ':scope div.a-fixed-left-grid'
const URL_SELECTOR = ':scope div.yohtmlc-item a, div[data-component="itemTitle"] a'
const PRICE_SELECTOR = ':scope span.a-color-price, div[data-component="unitPrice"] > span > span.a-offscreen'
const QUANTITY_SELECTOR = ':scope div.od-item-view-qty'
import { getAmountFromStr } from "./money-utils"


export function getOrderItems(shipmentElem, country = null, rate = null) {
	const orderItemElems = shipmentElem.querySelectorAll(ORDER_ITEM_SELECTOR)
	let orderItems = {}
	for (let orderItemElem of orderItemElems) {
		const orderItem = getOrderItemFromElem(orderItemElem, country, rate)
		orderItems[orderItem.asin] = orderItem;

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


function getOrderItemFromElem(orderItemElem, country, rate) {
	const item = orderItemElem.querySelector(URL_SELECTOR)
	const itemUrl = item?.getAttribute('href')
	if (!itemUrl) {
		return null;
	}
	const asin = getAsinFromUrl(itemUrl)
	const priceStr = orderItemElem.querySelector(PRICE_SELECTOR)?.textContent?.trim()
	const price = getAmountFromStr(priceStr, country, rate)
	let quantity = 1
	let quantSel = orderItemElem.querySelector(QUANTITY_SELECTOR)
	if (quantSel) {
		quantity = Number(quantSel.textContent?.trim())
	}
	const cost = quantity * price

	return {
		asin,
		"cost": Number(Number(cost).toFixed(2)),
		quantity,
	}
}
