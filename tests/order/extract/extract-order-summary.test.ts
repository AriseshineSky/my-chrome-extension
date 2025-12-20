// tests/order/extract/extract-order-summary.test.ts
import { describe, it, expect } from "vitest";
import { extractOrderSummary } from "@/order/extract/extract-order-summary";
import { loadHTML } from "../../utils/load-html";

import { ORDER_SELECTOR } from "@/order/list/order-selectors";

describe("extractOrderSummary (UK orders list)", () => {
  const doc = loadHTML("uk-orders.html");

  const orderCards = Array.from(
    doc.querySelectorAll(ORDER_SELECTOR),
  );

  it("should find order cards on list page", () => {
    expect(orderCards.length).toBeGreaterThan(0);
  });

  orderCards.slice(0, 3).forEach((orderCard, index) => {
    it(`extracts summary from order card #${index + 1}`, () => {
      const summary = extractOrderSummary(orderCard);
			console.log(summary)

      expect(summary).toHaveProperty("orderNumber");
      expect(summary).toHaveProperty("orderDate");
      expect(summary).toHaveProperty("shipTo");
      expect(summary).toHaveProperty("placedBy");

      if (summary.orderNumber) {
        expect(summary.orderNumber).toMatch(/\d{3}-\d{7}-\d{7}/);
      }

      if (summary.orderDate) {
        expect(summary.orderDate.length).toBeGreaterThan(0);
      }

      if (summary.shipTo) {
        expect(summary.shipTo.length).toBeGreaterThan(0);
      }

      if (summary.placedBy) {
        expect(summary.placedBy.length).toBeGreaterThan(0);
      }
    });
  });
});

describe("extractOrderSummary (US orders list)", () => {
  const doc = loadHTML("us-orders.html");

  const orderCards = Array.from(
    doc.querySelectorAll("div.order-card, div#orderCard"),
  );

  it("should find order cards on list page", () => {
    expect(orderCards.length).toBeGreaterThan(0);
  });

  orderCards.slice(0, 3).forEach((orderCard, index) => {
    it(`extracts summary from order card #${index + 1}`, () => {
      const summary = extractOrderSummary(orderCard);
			console.log(summary)

      expect(summary).toHaveProperty("orderNumber");
      expect(summary).toHaveProperty("orderDate");
      expect(summary).toHaveProperty("shipTo");
      expect(summary).toHaveProperty("placedBy");

      if (summary.orderNumber) {
        expect(summary.orderNumber).toMatch(/\d{3}-\d{7}-\d{7}/);
      }

      if (summary.orderDate) {
        expect(summary.orderDate.length).toBeGreaterThan(0);
      }

      if (summary.shipTo) {
        expect(summary.shipTo.length).toBeGreaterThan(0);
      }

      if (summary.placedBy) {
        expect(summary.placedBy.length).toBeGreaterThan(0);
      }
    });
  });
});


describe("extractOrderSummary (UK biz orders list)", () => {
  const doc = loadHTML("uk-biz-orders.html");

  const orderCards = Array.from(
    doc.querySelectorAll(ORDER_SELECTOR),
  );

  it("should find order cards on list page", () => {
    expect(orderCards.length).toBeGreaterThan(0);
  });

  orderCards.slice(0, 3).forEach((orderCard, index) => {
    it(`extracts summary from order card #${index + 1}`, () => {
      const summary = extractOrderSummary(orderCard);
			console.log(summary)

      expect(summary).toHaveProperty("orderNumber");
      expect(summary).toHaveProperty("orderDate");
      expect(summary).toHaveProperty("shipTo");
      expect(summary).toHaveProperty("placedBy");

      if (summary.orderNumber) {
        expect(summary.orderNumber).toMatch(/\d{3}-\d{7}-\d{7}/);
      }

      if (summary.orderDate) {
        expect(summary.orderDate.length).toBeGreaterThan(0);
      }

      if (summary.shipTo) {
        expect(summary.shipTo.length).toBeGreaterThan(0);
      }

      if (summary.placedBy) {
        expect(summary.placedBy.length).toBeGreaterThan(0);
      }
    });
  });
});
