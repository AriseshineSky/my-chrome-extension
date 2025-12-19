// src/order/save/save-orders.ts
import { post } from "../../services/api";
import { toOrderRecord } from "../../persistence/to-order-record";
import { Order } from "@/domain/Order";

export async function saveOrders(
  user: { email: string, source: string },
  orders: Order[],
) {
  if (!orders.length) return;

  const records = orders.map(order =>
    toOrderRecord(order),
  );

  await post({orders: records, user_email: user.email, source: user.source});
}

