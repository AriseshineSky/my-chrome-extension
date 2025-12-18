import {  getOrderBasicInfo } from "./order-details";
import { User } from './content'
import { fetchInfo, post } from "../services/api";

export const ORDER_SELECTOR = "div.order-card, div#orderCard";

const NEXT_PAGE_SELECTOR = "ul.a-pagination > li.a-last > a";

export interface Order {
  orderNumber: string;
  buyOrderDate: string | null;
  shipTo: string | null;

  subTotal: number;
  tax: number;
  shipping: number;
  total: number;

  originalCurrency: string;
  originalCost: number;
  usdCost: number;
  exchangeRate: number;
  exchangeRateSource: 'page' | 'default' | 'identity' | 'unknown';

  address?: string;
  paymentMethod?: string;
}

export interface OrderWithLogistics extends Order {
  shipments?: Record<string, any>;
}

export async function getOrders(): Promise<OrderWithLogistics[]> {
  const divOrders = document.querySelectorAll(ORDER_SELECTOR);
	const orders = await Promise.all(
		Array.from(divOrders).map(div => getOrderInfo(div).catch(() => null))
	);

	return orders.filter(
    (o): o is OrderWithLogistics => o !== null
  );
}

export async function syncOrders(user: User) {
  const orders = await getOrders();

  await saveOrders(user, orders);

  if (!isOrdersExpired(orders)) {
    goToNextPage();
    return false;
  }
  return true;
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

export async function getOrderInfo(
  divOrder: Element,
  fetchDoc: FetchDoc = fetchInfo
): Promise<OrderWithLogistics> {
  const { orderNumber, orderDate: orderDateStr, shipTo } =
    extractOrderInfo(divOrder);

  const doc = await fetchDoc(getOrderDetailUrl(divOrder));
  const basic = await getOrderBasicInfo(doc);

  const dateObj = new Date(orderDateStr);
  const buyOrderDate = isNaN(dateObj.getTime())
    ? null
    : dateObj.toISOString().split("T")[0];

  return {
    orderNumber,
    buyOrderDate,
    shipTo,
    ...basic,
  };
}

export async function saveOrders(user: User, orders: OrderWithLogistics[]) {
  const records = orders.map(order =>
    convertOrderToPost({ ...order, buy_account: user.email })
  );

  if (records.length) {
    await post(records);
  }
}

function convertOrderToPost(order: Order & { buy_account: string }) {
  return {
    buy_account: order.buy_account,
    order_number: order.orderNumber,
    buy_order_date: order.buyOrderDate,
    ship_to: order.shipTo,

    sub_total: order.subTotal,
    tax: order.tax,
    shipping: order.shipping,
    total: order.total,

    original_currency: order.originalCurrency,
    original_cost: order.originalCost,
    usd_cost: order.usdCost,
    exchange_rate: order.exchangeRate,
    exchange_rate_source: order.exchangeRateSource,

    address: order.address,
    payment_method: order.paymentMethod,

    last_checked_at: new Date().toISOString(),
  };
}

function formatShipments(shipments: Record<string, any>, cost) {
  return Object.entries(shipments).map(([shipmentId, s]) => ({
    shipment_id: shipmentId,
    shipment_status: s.shipmentStatus,
    tracking: s.trackingInfo?.tracking ?? null,
    carrier: s.trackingInfo?.carrier ?? null,
    items: getShipmentItems(s.orderItems, cost),
  }));
}

function getShipmentItems(orderItems, cost): ShipmentItem[] {
  const subTotal = Number(cost?.subTotal ?? 0);
  const taxTotal = Number(cost?.taxTotal ?? 0);
  const shippingTotal = Number(cost?.buy_shipping_fee ?? 0);

  return Object.entries(orderItems).map(([asin, item]) => {
    const itemCost = Number(item.cost ?? 0);
    const ratio = subTotal > 0 ? itemCost / subTotal : 0;

    return {
      asin,
      cost: itemCost,
      quantity: item.quantity ?? 1,
      tax: Number((taxTotal * ratio).toFixed(2)),
      shipping_fee: Number((shippingTotal * ratio).toFixed(2)),
    };
  });
}

export function isOrdersExpired(orders: Order[]) {
  return orders.some(order =>
    order.buyOrderDate && checkExpiredOrderDate(order.buyOrderDate)
  );
}

interface ShipmentItem {
  asin: string;
  cost: number;
  quantity: number;
  tax: number;
  shipping_fee: number;
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

