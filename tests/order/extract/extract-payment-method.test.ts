// tests/order/extract/extract-payment-method.test.ts
import { describe, it, expect } from "vitest";
import { extractPaymentMethod } from "@/order/extract/extract-payment-method";
import { EXPECTED_PAYMENT_METHOD } from "../../fixtures/order/expected-payment-method";
import { loadHTML } from "../../utils/load-html";

describe("extract payment method ", () => {
  Object.entries(EXPECTED_PAYMENT_METHOD).forEach(
    ([file, expected]) => {
      it(`extracts order cost info from ${file}`, () => {
        const doc = loadHTML(file);
        const actual = extractPaymentMethod(doc);

        console.log(file, actual);

        expect(actual).toEqual(expected);
      });
    },
  );
});

