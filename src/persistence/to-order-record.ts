export function toOrderRecord(order: & { buy_account: string }) {
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

