// src/order/save/save-orders.ts
import { post } from "../../services/api";
import { toOrderRecord } from "../../persistence/toOrderRecord";

export async function saveOrders(user, orders) {
  const records = orders.map(o => toOrderRecord(o, user.email));
  if (records.length) await post(records);
}

