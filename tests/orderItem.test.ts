import { describe, it, expect } from "vitest";
import { getOrderItems } from "../content/order-item";
import { loadHTML } from "./utils";

vi.mock("../content/money-utils", () => ({
  getAmountFromStr: vi.fn((priceStr, country, rate) => {
    const num = Number(priceStr.replace(/[^0-9.,]/g, "").replace(",", "."))
    return num * (rate || 1)
  }),
}));

const EXPECTED_ITEMS = {
  "111-6784099-6345037.html": {
    B06XYNHFF2: {
      asin: 'B06XYNHFF2',
      originalCost: 4.48,
      originalAmount: 4.48,
      originalCurrency: '$',
      cost: 4.48,
      quantity: 1,
      rate: null,
      priceStr: '$4.48'
    }
  },
  "112-5975653-8865058.html": {
    B0BYYMQNQV: {
      asin: 'B0BYYMQNQV',
      originalCost: 25.98,
      originalAmount: 25.98,
      originalCurrency: '$',
      cost: 25.98,
      quantity: 1,
      rate: null,
      priceStr: '$25.98'
    }
  },
	"202-2103857-5887544.html": {
		 B012A8RF3O: {
			asin: 'B012A8RF3O',
			originalCost: 16.99,
			originalAmount: 16.99,
			originalCurrency: '£',
			cost: 16.99,
			quantity: 1,
			rate: null,
			priceStr: '£16.99'
		}
	}
};

const FIXTURE_FILES = Object.keys(EXPECTED_ITEMS);

describe("getOrderItems", () => {
  for (const file of FIXTURE_FILES) {
    it(`should extract order items correctly from ${file}`, () => {
      const doc = loadHTML(file);
      const shipmentElem = doc.querySelector('div[data-component="shipments"] .a-box');
      expect(shipmentElem).not.toBeNull();

      const items = getOrderItems(shipmentElem);
			console.log(items)

      expect(Object.keys(items).length).toBe(Object.keys(EXPECTED_ITEMS[file]).length);

      for (const asin in EXPECTED_ITEMS[file]) {
        const expected = EXPECTED_ITEMS[file][asin];
        const actual = items[asin];

        expect(actual).toBeDefined();
        expect(actual.asin).toBe(expected.asin);
        expect(actual.quantity).toBe(expected.quantity);
        expect(actual.originalCost).toBeCloseTo(expected.originalCost, 2);
        expect(actual.originalAmount).toBeCloseTo(expected.originalAmount, 2);
        expect(actual.originalCurrency).toBe(expected.originalCurrency);
        expect(actual.cost).toBeCloseTo(expected.cost, 2);
        expect(actual.rate).toBe(expected.rate);
        expect(actual.priceStr).toBe(expected.priceStr);
      }
    });
  }
});


