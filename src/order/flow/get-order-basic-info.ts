import { extractOrderCost } from "../extract/extract-order-cost";
import { extractPaymentMethod } from "../extract/extract-payment-method";
import { extractShippingAddress } from "../extract/extract-shipping-address";
import { convertOrderCostToUSD } from "../../money/convert-to-usd";

export async function getOrderBasicInfo(doc: Document) {
  const rawCost = extractOrderCost(doc);
  const cost = await convertOrderCostToUSD(rawCost);

  return {
    subTotal: cost.subTotal ?? 0,
    tax: cost.tax ?? 0,
    shipping: cost.shipping ?? 0,

    original_currency: cost.original_currency ?? "UNKNOWN",
    original_cost: cost.original_cost ?? 0,

    usd_cost: cost.usd_cost ?? 0,
    exchange_rate: cost.exchange_rate ?? 1,

    address: extractShippingAddress(doc),
    paymentMethod: extractPaymentMethod(doc),
  };
}

