import { describe, it, expect } from "vitest";
import { getOrderBasicInfo } from "../content/order-details";
import { loadHTML } from "./utils";

vi.mock("../content/money-utils", () => ({
  getAmountFromStr: vi.fn((priceStr, country, rate) => {
    const num = Number(priceStr.replace(/[^0-9.,]/g, "").replace(",", "."))
    return num * (rate || 1)
  }),
}));
const EXPECTED_ORDERS = {
  "111-6784099-6345037.html": {
    subTotal: 4.48,
    tax: 0.36,
    shipping: 0,
    total: 4.84,
    original_currency: "USD",
    original_cost: 4.84,
    usd_cost: 4.84,
    exchange_rate: 1,
    address: "JOYZ   1140056, 2101 E TERRA LNO FALLON, MO 63366-4513, United States",
    paymentMethod: "AMEX ending in 2044",
  },
  "112-5975653-8865058.html": {
    subTotal: 25.98,
    tax: 2.07,
    shipping: 0,
    total: 28.05,
    original_currency: "USD",
    original_cost: 28.05,
    usd_cost: 28.05,
    exchange_rate: 1,
    address: "JOYZ  8567118, 2101 E TERRA LNO FALLON, MO 63366-4513, United States",
    paymentMethod: "AMEX ending in 2077",
  },
  "206-2592338-8891513.html": {
    buy_order_number: '',
		buy_order_date: '',
		subTotal: 16.62,
		tax: 3.32,
		shipping: 0,
		total: 19.94,
		original_currency: 'GBP',
		original_cost: 19.94,
		usd_cost: 19.94,
		exchange_rate: 1,
		address: 'Amber Chiu, BIRD IN EYE FARMHOUSE BIRD IN EYE HILL8773969FRAMFIELD TN22 5HA, United Kingdom',
		paymentMethod: "Visa •••• 9618"

  },
	"202-2103857-5887544.html": {
		buy_order_number: '',
		buy_order_date: '',
		subTotal: 14.16,
		tax: 2.83,
		shipping: 0,
		total: 16.99,
		original_currency: 'GBP',
		original_cost: 16.99,
		usd_cost: 23.39,
		exchange_rate: 1.3767,
		address: 'Levi Lyu, BRAND PORT EUROPE LTD UNIT 3 74 BELL LANE9654958Uckfield TN22 1QL, United Kingdom',
		paymentMethod: 'AMEX ending in 1038'
	}
};

const FIXTURE_FILES = Object.keys(EXPECTED_ORDERS);

describe("getOrderBasicInfo", () => {
  for (const file of FIXTURE_FILES) {
    it(`should extract order info correctly from ${file}`, async () => {
      const doc = loadHTML(file);
      const info = await getOrderBasicInfo(doc);
			console.log(info)
      const expected = EXPECTED_ORDERS[file];

      expect(info.subTotal).toBeCloseTo(expected.subTotal, 2);
      expect(info.tax).toBeCloseTo(expected.tax, 2);
      expect(info.shipping).toBeCloseTo(expected.shipping, 2);
      expect(info.total).toBeCloseTo(expected.total, 2);

      expect(info.original_currency).toBe(expected.original_currency);
      expect(info.original_cost).toBeCloseTo(expected.original_cost, 2);
      expect(info.usd_cost).toBeCloseTo(expected.usd_cost, 2);
      expect(info.exchange_rate).toBeCloseTo(expected.exchange_rate, 4);

      expect(info.address).toBe(expected.address);
      expect(info.paymentMethod).toBe(expected.paymentMethod);
    });
  }
});

