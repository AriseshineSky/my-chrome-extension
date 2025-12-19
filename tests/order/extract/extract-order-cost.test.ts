// tests/order/extract/extract-order-summary.test.ts
import { describe, it, expect } from "vitest";
import { extractOrderCost } from "@/order/extract/extract-order-cost";
import { EXPECTED_ORDER_INFO } from "../../fixtures/order/expected-order-cost";
import { loadHTML } from "../../utils/load-html";

describe("extractOrderCost (111-6784099-6345037)", () => {
  Object.entries(EXPECTED_ORDER_INFO).forEach(
    ([file, expected]) => {
      it(`extracts order cost info from ${file}`, () => {
        const doc = loadHTML(file);
        const actual = extractOrderCost(doc);

        console.log(file, actual);

        expect(actual).toEqual(expected);
      });
    },
  );
});

