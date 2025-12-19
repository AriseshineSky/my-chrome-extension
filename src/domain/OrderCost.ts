// domain/OrderCost.ts
export interface OrderCost {
  orderNumber: string
  buyOrderDate: string | null
  shipTo: string | null
  cost: OrderCost
  shipments?: Shipment[]
}

