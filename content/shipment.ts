import { fetchTrackInfo } from './tracking'
import { getOrderItems } from './order-item'

export interface ShipmentInfo {
  shipmentId: string;
  orderItems: any[]; // 或具体类型
  shipmentStatus: string;
  trackingInfo: {
    tracking: string | null;
    carrier: string | null;
  };
}

const shipments: Record<string, ShipmentInfo> = {};

export const SHIPMENTS_SELECTOR = 'div[data-component="shipments"] div.a-box'
const SHIPMENT_STATUS_SELECTOR = ':scope div.js-shipment-info-container div.a-row:nth-of-type(1) span, :scope div#shipment-top-row h4'
const A_SELECTOR = ':scope a'


function getShipmentIdFromUrl(url: string) {
  try {
    const fullUrl = new URL(url, typeof window !== "undefined" ? window.location.origin : "http://localhost");
    const params = new URLSearchParams(fullUrl.search);
    return params.get("shipmentId");
  } catch {
    return null;
  }
}

function getShipmentIdFromElem(shipmentElem) {
	const aElems = shipmentElem.querySelectorAll(A_SELECTOR);
	for (const aElem of aElems) {
		const url = aElem.getAttribute("href");
		if (!url) continue;
		const shipmentId = getShipmentIdFromUrl(url);
		if (shipmentId) return shipmentId;
	}
	return null;
}

async function getShipment(shipmentElem, country = null, rate = null) {
	const shipmentId = getShipmentIdFromElem(shipmentElem);
	if (!shipmentId) return null;

	let orderItems = getOrderItems(shipmentElem, country, rate);
	if (!Array.isArray(orderItems)) orderItems = [];
	const shipmentStatus = shipmentElem.querySelector(SHIPMENT_STATUS_SELECTOR)?.textContent?.trim() ?? "";
	const trackingInfo = await fetchTrackInfo(shipmentElem);

	return { shipmentId, orderItems, shipmentStatus, trackingInfo };
}

export async function getShipments(doc, country = null, rate = null) {
	const shipmentElems = doc.querySelectorAll(SHIPMENTS_SELECTOR);
	const shipments: Record<string, any> = {};

	for (const shipmentElem of shipmentElems) {
		if (!shipmentElem.innerHTML?.trim()) continue;
		const shipment = await getShipment(shipmentElem, country, rate);
		if (shipment?.shipmentId) shipments[shipment.shipmentId] = shipment;
	}

	return shipments;
}

