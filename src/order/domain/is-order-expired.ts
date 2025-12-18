import type { Order } from "../../domain/Order";

export function isOrdersExpired(orders: Order[]): boolean {
  return orders.some(order =>
    order.buyOrderDate && isExpired(order.buyOrderDate),
  );
}

function isExpired(dateStr: string): boolean {
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return false;

  const threeMonthsAgo = new Date();
  threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

  return date < threeMonthsAgo;
}

