import { getOrderCost, getShippingAddress } from "./order-details";
import { getShipments } from './shipment'

import { User } from './content'

import { fetchInfo, post, put } from "../services/api";
import { getDateObj } from "./time-utils";
import { RATES } from "./rate";

const ORDER_SELECTOR = "div.order-card";
const ORDER_NUMBER_SELECTOR = ':scope bdi[dir="ltr"], :scope span[dir="ltr"]';
const PURCHASE_DATE_SELECTOR =
	":scope .a-column.a-span4 .a-size-base, :scope .a-column.a-span4 > .a-row.a-size-base, :scope div.a-span3 span.a-size-base, :scope div.a-span3 div.a-size-base > span";
const ORDER_TOTAL_COST_SELECTOR =
	":scope div.order-header div.a-span2 span.aok-break-word";

const NEXT_PAGE_SELECTOR = "ul.a-pagination > li.a-last > a";

export async function getOrders(doc: Document, country: string, user: User) {
	const orders = {};
	const divOrders = doc.querySelectorAll(ORDER_SELECTOR)
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

const ORDER_URL_SELECTOR = "div.a-row .yohtmlc-order-details-link, div.a-row > .yohtmlc-order-level-connections a";

function getOrderDetailUrl(divOrder) {
	const orderDetailUrl = divOrder.querySelector(ORDER_URL_SELECTOR);
	return orderDetailUrl?.getAttribute("href").replace("css", "your-account");
}

function getAmountFromStr(orderTotalCostStr: string, country: string, rate = null): string {
	if (rate === null) {
		rate = RATES[country];
	}
	return (Number(orderTotalCostStr.replace(/[$£]/g, "")) * rate).toFixed(2);
}

async function getOrderInfo(divOrder, country) {
	const orderNo = divOrder.querySelector(ORDER_NUMBER_SELECTOR).textContent.trim()
	const orderTotalCostStr = divOrder.querySelector(ORDER_TOTAL_COST_SELECTOR)?.textContent?.trim()
	const orderDate = getDateObj(divOrder.querySelector(PURCHASE_DATE_SELECTOR).textContent.trim().toLowerCase(), country)
	const orderDetailUrl = getOrderDetailUrl(divOrder)
	const orderBasicDoc = await fetchInfo(orderDetailUrl)

	const orderBasicInfo = await getOrderBasicInfo(orderBasicDoc, country);
	const rate = orderBasicInfo.cost.rate;
	const orderTotalCost = getAmountFromStr(orderTotalCostStr, country, rate);

	const orderInfo = {
		"buy_order_number": orderNo,
		"buy_cost": orderTotalCost,
		"buy_order_date": orderDate.toISOString().split("T")[0],
		...orderBasicInfo,
	}
	console.log(orderInfo)
	return orderInfo;
}

async function getOrderBasicInfo(doc, country) {
	const cost = getOrderCost(
		doc.body.textContent.replace(/\s+/g, " ").trim(),
		country,
	);
	const rate = cost.rate;
	const address = getShippingAddress(doc);
	const shipments = await getShipments(doc, country, rate);

	return {
		cost,
		address,
		shipments,
	};
}

function getOrdersFromLocal(user) {
	const users = JSON.parse(localStorage.getItem("users") ?? "{}");
	return users[user.email]?.orders ?? {};
}

function saveOrdersToLocal(user, orders) {
	const users = JSON.parse(localStorage.getItem("users") ?? "{}");
	users[user.email] ??= {};
	users[user.email].orders = orders;
	localStorage.setItem("users", JSON.stringify(users));
}

export async function saveOrders(user, orders) {
	const localOrders = getOrdersFromLocal(user)
	const newOrders = [];

	for (let orderNumber in orders) {
		const newOrder = convertOrderToPost(orders[orderNumber])
		newOrder.buy_account = user.email

		newOrders.push(newOrder)
		localOrders[orderNumber] = orders[orderNumber];

		if (orderNumber in localOrders) {
			await put(orders[orderNumber])
		} else {
			newOrders.push(newOrder)
			localOrders[orderNumber] = orders[orderNumber];
		}
	}
	await post(newOrders);
	// saveOrdersToLocal(user, localOrders);
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

