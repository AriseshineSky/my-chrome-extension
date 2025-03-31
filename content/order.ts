import { getOrderCost, getShippingAddress } from "./order-details";
import { getShipments } from "./order-item";
import { fetchInfo, post, put } from "../services/api";
import { getDateObj } from "./time-utils";

const ORDER_SELECTOR = "div.order-card";
const ORDER_NUMBER_SELECTOR = ':scope bdi[dir="ltr"], :scope span[dir="ltr"]';
const PURCHASE_DATE_SELECTOR =
	":scope .a-column.a-span4 .a-size-base, :scope .a-column.a-span4 > .a-row.a-size-base, :scope div.a-span3 span.a-size-base, :scope div.a-span3 div.a-size-base > span";
const ORDER_TOTAL_COST_SELECTOR =
	":scope div.order-header div.a-span2 span.aok-break-word";

export async function getOrders(doc, country) {
	const divOrders = doc.querySelectorAll(ORDER_SELECTOR);
	for (const divOrder of divOrders) {
		try {
			await getOrderInfo(divOrder, country);
		} catch (e) {
			console.log(e);
		}
	}
}

const ORDER_URL_SELECTOR =
	"div.a-row a.yohtmlc-order-details-link, div.a-row > div.yohtmlc-order-level-connections > a";

function getOrderDetailUrl(divOrder) {
	const orderDetailUrl = divOrder.querySelector(ORDER_URL_SELECTOR);
	return orderDetailUrl?.getAttribute("href").replace("css", "your-account");
}

function getAmountFromStr(orderTotalCostStr, country) {
	if (country === "us") {
		return Number(orderTotalCostStr.replace("$", ""));
	}
}
async function getOrderInfo(divOrder, country) {
	const orderNo = divOrder
		.querySelector(ORDER_NUMBER_SELECTOR)
		.textContent.trim();
	const orderTotalCostStr = divOrder
		.querySelector(ORDER_TOTAL_COST_SELECTOR)
		?.textContent.trim();
	const orderTotalCost = getAmountFromStr(orderTotalCostStr, country);
	const orderDate = getDateObj(
		divOrder
			.querySelector(PURCHASE_DATE_SELECTOR)
			.textContent.trim()
			.toLowerCase(),
		country,
	);
	const orderDetailUrl = getOrderDetailUrl(divOrder);
	const orderBasicDoc = await fetchInfo(orderDetailUrl);
	const orderBasicInfo = await getOrderBasicInfo(orderBasicDoc);

	const orderInfo = {
		buy_order_number: orderNo,
		buy_cost: orderTotalCost,
		buy_order_date: orderDate.toISOString().split("T")[0],
		...orderBasicInfo,
	};
	console.log(orderInfo);
	return orderInfo;
}

async function getOrderBasicInfo(doc) {
	const cost = getOrderCost(
		doc.body.textContent.replace(/\s+/g, " ").trim(),
		"us",
		1,
	);
	const address = getShippingAddress(doc);
	const shipments = await getShipments(doc);

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
