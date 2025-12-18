import {  getOrderBasicInfo } from "./order-details";
import { User } from './content'
import { fetchInfo, post, put } from "../services/api";

export const ORDER_SELECTOR = "div.order-card, div#orderCard";

const NEXT_PAGE_SELECTOR = "ul.a-pagination > li.a-last > a";

export async function getOrders(country: string, user: User) {
	const orders = {};
	const divOrders = document.querySelectorAll(ORDER_SELECTOR)
	for (const divOrder of divOrders) {
		try {
			const order = await getOrderInfo(divOrder, country);
			console.log(order);
			if (order && order.buy_order_number) {
				order['buy_account'] = user.email;
				orders[order.buy_order_number] = order;
			}
		} catch (e) {
			console.log(e)
		}
	}

	await saveOrders(user, orders)

	if (!isOrdersExpired(orders)) {
		goToNextPage()
		return false;
	} else {
		return true;
	}

}

export function goToOrderHistoryPage() {
	const orderHistoryPage = "/your-orders/orders"
	const fullUrl = getFullUrl(orderHistoryPage);
	console.log("Go to order history:", fullUrl);
	window.location.href = fullUrl;
}

function goToNextPage() {
	const nextSel = document.querySelector(NEXT_PAGE_SELECTOR);
	if (!nextSel) {
		console.log("Page end. No next page found.");
		return;
	}

	const nextHref = nextSel.getAttribute("href");
	if (!nextHref) {
		console.log("Next page URL is missing.");
		sessionStorage.removeItem('active')
		sessionStorage.removeItem("isRunning");
		return;
	}

	const fullUrl = getFullUrl(nextHref);
	console.log("Navigating to next page:", fullUrl);
	window.location.href = fullUrl;
}

// const ORDER_URL_SELECTOR = "div.a-row .yohtmlc-order-details-link, div.a-row > .yohtmlc-order-level-connections a";
const ORDER_URL_SELECTOR = `
  a[href*="/gp/css/order-details"],
  a[data-savepage-href*="/gp/css/order-details"],
  a[href*="order-details?orderID="],
  .yohtmlc-order-details-link,
  .yohtmlc-order-level-connections a
`;

function getOrderDetailUrl(divOrder: Element): string {
  const link = divOrder.querySelector(ORDER_URL_SELECTOR);
  if (!link) {
    throw new Error("Order detail link not found");
  }

  const href =
    link.getAttribute("data-savepage-href") ||
    link.getAttribute("href");

  if (!href) {
    throw new Error("Order detail href missing");
  }

  return href.replace("/gp/css/", "/gp/your-account/");
}



export function extractOrderInfo(root: Element) {
  const labelOrder = Array.from(root.querySelectorAll("span"))
    .find(el => el.textContent?.trim() === "Order #");
  const rowOrder = labelOrder?.closest(".a-row") ?? labelOrder?.parentElement;
  const orderNumber = rowOrder?.textContent?.match(/\b\d{3}-\d{7}-\d{7}\b/)?.[0] ?? null;

  const labelDate = Array.from(root.querySelectorAll(".a-column"))
    .find(col => col.querySelector(".a-row.a-color-secondary")?.textContent.trim() === "Order placed");
  const orderDate = labelDate?.querySelector(".a-row.a-size-base")?.textContent.trim() ?? null;

  const labelTotal = Array.from(root.querySelectorAll(".a-column"))
    .find(col => col.querySelector(".a-row.a-color-secondary")?.textContent.trim() === "Total");
  const totalCost = labelTotal?.querySelector(".a-row.a-size-base")?.textContent.trim() ?? null;

  const labelShipTo = root.querySelector(".a-column .a-popover-preload .a-text-bold");
  const shipTo = labelShipTo?.textContent.trim() ?? null;

  const labelPlacedBy = root.querySelector(".a-column:nth-child(4) .a-truncate-full");
  const placedBy = labelPlacedBy?.textContent.trim() ?? null;

  return {
    orderNumber,
    orderDate,
    totalCost,
    shipTo,
    placedBy
  };
}

type FetchDoc = (url: string) => Promise<Document>;

export async function getOrderInfo(divOrder: Element, country: String, fetchDoc: FetchDoc = fetchInfo) {
  const {
    orderNumber,
    orderDate: orderDateStr,
    shipTo,
  } = extractOrderInfo(divOrder)

	const orderDetailUrl = getOrderDetailUrl(divOrder)
	const orderBasicDoc = await fetchDoc(orderDetailUrl)
	const orderBasicInfo = await getOrderBasicInfo(orderBasicDoc);
	const orderDateObj = new Date(orderDateStr);
  const orderDateISO = isNaN(orderDateObj.getTime())
    ? null
    : orderDateObj.toISOString().split("T")[0];

	const orderInfo = {
		orderNumber: orderNumber,
		buy_order_number: orderNumber,
    buy_order_date: orderDateISO,
    ship_to: shipTo,
    ...orderBasicInfo,
  };

  console.log(orderInfo);
  return orderInfo;
}

export function extractOrderSummary(doc) {
	const orderSummaryRegex = /(Item\(s\) Subtotal|Shipping & Handling|Promotion Applied|Total before tax|Estimated tax to be collected|Grand Total):\s*([-\$0-9.,]+)/g;

  const result: Record<string, number> = {};
  let match: RegExpExecArray | null;

  while ((match = orderSummaryRegex.exec(text)) !== null) {
    const label = match[1];
    const value = parseFloat(match[2].replace(/[$,]/g, ""));
    result[label] = value;
  }

  return result;
}

export async function saveOrders(user, orders) {
	const newOrders = [];

	for (let orderNumber in orders) {
		const newOrder = convertOrderToPost(orders[orderNumber])
		newOrder.buy_account = user.email

		newOrders.push(newOrder)

		if (orderNumber in localOrders) {
			await put(orders[orderNumber])
		} else {
			newOrders.push(newOrder)
		}
	}
	await post(newOrders);
}


function convertOrderToPost(order) {
	if (order.cost?.paymenTotal) {
		order.buy_cost = order.cost.paymenTotal
	};
	order.buy_shipping_fee = order.cost?.buy_shipping_fee ?? 0
	order.buy_tax = order.cost?.taxTotal ?? null
	order.shipments = formatShipments(order.shipments, order.cost)
	order.last_checked_at = new Date().toISOString()
	order.buy_shipping_address = order.address;
	return order;
}

function formatShipments(shipments, cost) {
	const newShipments = []
	for (const shipmentId in shipments) {
		const shipment = {}
		shipment["shipment_id"] = shipmentId
		shipment["shipment_status"] = shipments[shipmentId]['shipmentStatus']
		shipment["tracking"] = shipments[shipmentId]['trackingInfo']['tracking']
		shipment["carrier"] = shipments[shipmentId]['trackingInfo']['carrier']
		shipment["items"] = getShipmentItems(shipments[shipmentId]['orderItems'], cost)
		newShipments.push(shipment)
	}
	return newShipments;
}

function getShipmentItems(orderItems, cost) {
	const items = []
	for (const asin in orderItems) {
		const item = { asin }
		item["cost"] = orderItems[asin]["cost"]
		item["quantity"] = orderItems[asin]["quantity"]
		item["tax"] = Number(Number(item["cost"]) / Number(cost.subTotal ?? null) * Number(cost?.taxTotal ?? null)).toFixed(2)
		item["shipping_fee"] = Number(Number(item["cost"]) / Number(cost.subTotal) * Number(cost?.buy_shipping_fee ?? null)).toFixed(2)
		items.push(item)
	}
	return items;
}

export function isOrdersExpired(orders) {
	for (const orderNumber in orders) {
		if (checkExpiredOrderDate(orders[orderNumber]["buy_order_date"])) {
			return true;
		}
	}
	return false;
}

function checkExpiredOrderDate(dateStr) {
	const inputDate = new Date(dateStr);
	if (isNaN(inputDate)) {
		return false;
	}

	const currentDate = new Date();
	const threeMonthsAgo = new Date();
	threeMonthsAgo.setMonth(currentDate.getMonth() - 3);

	return inputDate < threeMonthsAgo;
}

function getFullUrl(relativePath: string) {
	const fullUrl = new URL(relativePath, window.location.origin);
	return fullUrl.href;
}

