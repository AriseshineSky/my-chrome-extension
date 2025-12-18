// domain/Order.ts
export interface Order {
  orderNumber: string
  buyOrderDate: string | null
  shipTo: string | null
  cost: OrderCost
  shipments?: Shipment[]
}

