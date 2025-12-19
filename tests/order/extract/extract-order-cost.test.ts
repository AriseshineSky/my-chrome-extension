// tests/order/extract/extract-order-summary.test.ts
import { describe, it, expect } from "vitest";
import { extractOrderCost } from "@/order/extract/extract-order-cost";
import { loadHTML } from "../../utils/load-html";

describe("extractOrderCost (111-6784099-6345037)", () => {
  const doc = loadHTML("order/111-6784099-6345037.html");

	const orderCost = extractOrderCost(doc)
	expect(orderCost).toEqual(
		{
			subTotal: 4.48,
			shipping: 0,
			tax: 0.36,
			total_before_tax: 4.48,
			original_total: 4.84,
			original_currency: 'USD',
			original_cost: 4.84,
			usd_cost: 4.84,
			exchange_rate: 1
		}
	)
});

