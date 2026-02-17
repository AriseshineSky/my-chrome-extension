// tests/order/extract/extract-order-summary.test.ts
import { describe, it, expect } from "vitest";
import { extractOrderCost } from "@/order/extract/extract-order-cost";
import { EXPECTED_ORDER_INFO } from "../../fixtures/order/expected-order-cost";
import { loadHTML } from "../../utils/load-html";

function inferDomainFromFile(file: string): string {
  if (file.includes(".com.mx")) return "www.amazon.com.mx";
  if (file.includes("/mx/")) return "www.amazon.com.mx";
  if (file.includes("/uk/")) return "www.amazon.co.uk";
  if (file.includes("/de/")) return "www.amazon.de";
  return "www.amazon.com";
}

describe("extractOrderCost", () => {
  Object.entries(EXPECTED_ORDER_INFO).forEach(
    ([file, expected]) => {
      it(`extracts order cost info from ${file}`, () => {
        const doc = loadHTML(file);
				const domain = inferDomainFromFile(file);
        const actual = extractOrderCost(doc, { domain });
        expect(actual).toEqual(expected);
      });
    },
  );
});

