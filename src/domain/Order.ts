// domain/Order.ts
import {Shipment} from "./Shipment"
import {OrderCost} from "./OrderCost"

export interface Order {
  orderNumber: string;
  buyOrderDate: string | null;
  shipTo: string | null;
  cost: any;
	shipments: Record<string, Shipment>;
	paymentMethod?: string;
	address: string;
}

