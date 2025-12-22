import { describe, it, expect } from "vitest";
import { extractOrderItems } from "@/shipment/extract/extract-order-items";
import { loadHTML } from "../utils/load-html";

import { SHIPMENT_SELECTOR } from "@/order/flow/build-shipments";
import { EXPECTED_SHIPMENT_ITEMS } from "../fixtures/order/expected-shipment-items";

describe("extractOrderItems", () => {
	Object.entries(EXPECTED_SHIPMENT_ITEMS).forEach(([file, expected]) => {
      it(`extracts shipment items from ${file}`, () => {
				const doc = loadHTML(file);
				const shipmentElem = doc.querySelector(SHIPMENT_SELECTOR);
				expect(shipmentElem).not.toBeNull();

				const actual = extractOrderItems(shipmentElem!);

        expect(actual).toEqual(expected);
      });
	})
});

