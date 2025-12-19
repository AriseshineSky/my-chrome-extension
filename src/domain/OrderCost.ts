// domain/OrderCost.ts
import {Shipment} from "./Shipment"

export interface OrderCost {
  payment_total: string
  exchange_rate: number
  payment_currency: string
  usd_cost: number
  final_paid_usd: number
  origial_cost: string
  tax: number
  shipping: number
  original_currency: string
  original_cost: string
  subTotal: number
}

