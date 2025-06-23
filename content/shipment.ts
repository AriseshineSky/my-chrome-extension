import { fetchTrackInfo } from './tracking'
import { getOrderItems } from './order-item'

export const SHIPMENTS_SELECTOR = 'div[data-component="shipments"] div.a-box'
const SHIPMENT_STATUS_SELECTOR = ':scope div.js-shipment-info-container div.a-row:nth-of-type(1) span, :scope div#shipment-top-row h4'
const A_SELECTOR = ':scope a'

export async function getShipments(doc, country = null, rate = null) {
	const shipmentElems = doc.querySelectorAll(SHIPMENTS_SELECTOR)
	let shipments = {};
	for (let shipmentElem of shipmentElems) {
		if (!shipmentElem.innerHTML?.trim()) {
			continue
		}
		const shipment = await getShipment(shipmentElem, country, rate)
		if (shipment && shipment.shipmentId) {
			shipments[shipment.shipmentId] = shipment;
		}
	}
	return shipments;
}

function getShipmentIdFromUrl(url) {
	const fullUrl = new URL(url, window.location.origin);
	const params = new URLSearchParams(fullUrl.search);
	return params.get("shipmentId");
}

function getShipmentIdFromElem(shipmentElem) {
	const aElems = shipmentElem.querySelectorAll(A_SELECTOR);
	for (let aElem of aElems) {
		const url = aElem.getAttribute('href');
		const shipmentId = getShipmentIdFromUrl(url)
		if (shipmentId) {
			return shipmentId;
		}
	}
}

async function getShipment(shipmentElem, country = null, rate = null) {
	const shipmentId = getShipmentIdFromElem(shipmentElem)
	if (!shipmentId) {
		return null;
	}
	const orderItems = getOrderItems(shipmentElem, country, rate)
	const shipmentStatus = shipmentElem.querySelector(SHIPMENT_STATUS_SELECTOR)?.textContent?.trim()
	const trackingInfo = await fetchTrackInfo(shipmentElem)
	return { shipmentId, orderItems, shipmentStatus, trackingInfo }
}
