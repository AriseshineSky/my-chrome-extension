import type { Order } from "../../domain/Order";

export function isOrdersExpired(orders: Order[]): boolean {
  return orders.some(order =>
    order.orderDate && isExpired(order.orderDate),
  );
}

function isExpired(dateStr: string): boolean {
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return false;

  const threeMonthsAgo = new Date();
  threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 1);

  return date < threeMonthsAgo;
}

