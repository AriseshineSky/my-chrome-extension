export const EXPECTED_TRACK_INFO: Record<
  string,
  { order: string | null; carrier: string | null }
> = {
  "order/111-6784099-6345037.html": {
		subTotal: 4.48,
		shipping: 0,
		tax: 0.36,
		total_before_tax: 4.48,
		original_total: 4.84,
		original_currency: 'USD',
		original_cost: 4.84,
		usd_cost: 4.84,
		exchange_rate: 1
  },
  "order/Ug9qr1K6K.html": {
    order: "UK2943871131",
    carrier: "Amazon",
  },
  "order/UJ9krSmsZ.html": {
    order: "UK3704754323",
    carrier: "Amazon",
  },
  "order/UXfxScdLW.html": {
    order: "UK2959311818",
    carrier: "Amazon",
  },
};
