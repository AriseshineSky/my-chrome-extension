
import { describe, it, expect } from "vitest";
import { extractShipmentId } from "@/shipment/extract/extract-shipment-id";
import { loadHTML } from "../utils/load-html";

describe("extractOrderItems", () => {
  it("extracts order items from shipment DOM", () => {
    const doc = loadHTML("order/111-6784099-6345037.html");

    // ⚠️ 这里 selector 要和你真实 shipment selector 一致
    const shipmentElem = doc.querySelector(
      'div[data-component="shipments"] div.a-box',
    );

    expect(shipmentElem).not.toBeNull();

    const shipmentId = extractShipmentId(shipmentElem!);

    expect(shipmentId).toBeDefined();
    expect(typeof shipmentId).toBe("string");

    expect(shipmentId).toBe("BW5XJjGqd");

  });
});

