// tests/order/extract/extract-order-summary.test.ts
import { describe, it, expect } from "vitest";
import { extractShippingAddress } from "@/order/extract/extract-shipping-address";
import { EXPECTED_SHIPPING_ADDRESS } from "../../fixtures/order/expected-shipping-address";
import { loadHTML } from "../../utils/load-html";

describe("extract shipping address", () => {
  Object.entries(EXPECTED_SHIPPING_ADDRESS).forEach(
    ([file, expected]) => {
      it(`extracts order cost info from ${file}`, () => {
        const doc = loadHTML(file);
        const actual = extractShippingAddress(doc);

        console.log(file, actual);

        expect(actual).toEqual(expected);
      });
    },
  );
});

