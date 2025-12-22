import { describe, it, expect } from "vitest";
import { extractOrderItems } from "@/shipment/extract/extract-order-items";
import { loadHTML } from "../utils/load-html";

import { SHIPMENT_SELECTOR } from "@/order/flow/build-shipments";

describe("extractOrderItems", () => {
  it("extracts order items from shipment DOM", () => {
    const doc = loadHTML("order/204-7573019-5215505.html");
    const shipmentElem = doc.querySelector(SHIPMENT_SELECTOR);
    expect(shipmentElem).not.toBeNull();

    const items = extractOrderItems(shipmentElem!);

    expect(items).toBeDefined();
    expect(typeof items).toBe("object");

    const values = Object.values(items);
    expect(values.length).toBeGreaterThan(0);

    for (const item of values) {
			console.log(item);
      expect(item).toHaveProperty("asin");
      expect(item.asin).toMatch(/^[A-Z0-9]{8,}$/);

      expect(item).toHaveProperty("quantity");
      expect(item.quantity).toBeGreaterThanOrEqual(1);

      expect(item).toHaveProperty("originalPrice");
      expect(typeof item.originalPrice).toBe("number");

      expect(item).toHaveProperty("originalCurrency");
      expect(
        typeof item.originalCurrency === "string" ||
          item.originalCurrency === null,
      ).toBe(true);
    }
  });

  it("extracts order items from shipment DOM", () => {
    const doc = loadHTML("order/111-6784099-6345037.html");

    // ⚠️ 这里 selector 要和你真实 shipment selector 一致
    const shipmentElem = doc.querySelector(SHIPMENT_SELECTOR);
    expect(shipmentElem).not.toBeNull();

    const items = extractOrderItems(shipmentElem!);

    expect(items).toBeDefined();
    expect(typeof items).toBe("object");

    const values = Object.values(items);
    expect(values.length).toBeGreaterThan(0);

    for (const item of values) {
      expect(item).toHaveProperty("asin");
      expect(item.asin).toMatch(/^[A-Z0-9]{8,}$/);

      expect(item).toHaveProperty("quantity");
      expect(item.quantity).toBeGreaterThanOrEqual(1);

      expect(item).toHaveProperty("originalPrice");
      expect(typeof item.originalPrice).toBe("number");

      expect(item).toHaveProperty("originalCurrency");
      expect(
        typeof item.originalCurrency === "string" ||
          item.originalCurrency === null,
      ).toBe(true);
    }
  });
});

