import { getOrderCost, getShippingAddress } from "./order-details";
import { getShipments } from './shipment'

import { fetchInfo, post, put } from "../services/api";
import { getDateObj } from "./time-utils";
import { RATES } from "./rate";

const ORDER_SELECTOR = "div.order-card";
const ORDER_NUMBER_SELECTOR = ':scope bdi[dir="ltr"], :scope span[dir="ltr"]';
const PURCHASE_DATE_SELECTOR =
	":scope .a-column.a-span4 .a-size-base, :scope .a-column.a-span4 > .a-row.a-size-base, :scope div.a-span3 span.a-size-base, :scope div.a-span3 div.a-size-base > span";
const ORDER_TOTAL_COST_SELECTOR =
	":scope div.order-header div.a-span2 span.aok-break-word";

export async function getOrders(doc, country: string, user) {
	const orders = {};
	const divOrders = doc.querySelectorAll(ORDER_SELECTOR)
	for (const divOrder of divOrders) {
		try {
			const order = await getOrderInfo(divOrder, country)
			if (order && order.buy_order_number) {
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


const ORDER_URL_SELECTOR =
	"div.a-row .yohtmlc-order-details-link, div.a-row > div.yohtmlc-order-level-connections a";

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
	console.log(rate)
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
	const localOrders = getOrdersFromLocal(user) || {};
	const newOrders = [];

	for (const orderNumber in orders) {
		if (localOrders[orderNumber]) {
			if (
				JSON.stringify(localOrders[orderNumber]) !==
				JSON.stringify(orders[orderNumber])
			) {
				await put(orders[orderNumber]);
			}
		} else {
			newOrders.push(orders[orderNumber]);
			localOrders[orderNumber] = orders[orderNumber];
		}
	}

	if (newOrders.length > 0) {
		await post(newOrders);
	}

	saveOrdersToLocal(user, localOrders);
}
