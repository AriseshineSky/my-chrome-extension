import { describe, it, expect, vi } from "vitest";
import { buildShipment } from "@/shipment/flow/build-shipment";
import { loadHTML } from "../utils/load-html";

/* ---------- mock 所有子模块 ---------- */
vi.mock("@/shipment/extract/extract-shipment-id", () => ({
  extractShipmentId: vi.fn(() => "BW5XJjGqd"),
}));

vi.mock("@/shipment/extract/extract-shipment-status", () => ({
  extractShipmentStatus: vi.fn(() => "Delivered"),
}));

vi.mock("@/shipment/extract/extract-order-items", () => ({
  extractOrderItems: vi.fn(() => ({
    BW5XJjGqd: {
			asin: 'B06XYNHFF2',
			quantity: 1,
			originalPrice: 4.48,
			originalCurrency: 'USD',
			originalCost: 4.48,
			priceText: '$4.48'
		}
  })),
}));

vi.mock("@/tracking/flow/build-tracking", () => ({
  buildTracking: vi.fn(async () => ({
    tracking: "TBA123",
    carrier: "Amazon",
  })),
}));

/* ---------- tests ---------- */
describe("buildShipment", () => {
  it("builds shipment object correctly", async () => {
    const doc = loadHTML("order/111-6784099-6345037.html");
    const elem = doc.querySelector("#shipment")!;

    const result = await buildShipment(elem);

    expect(result).toEqual({
      shipmentId: "BW5XJjGqd",
      status: "Delivered",
      items: {
        BW5XJjGqd: {
					asin: 'B06XYNHFF2',
					quantity: 1,
					originalPrice: 4.48,
					originalCurrency: 'USD',
					originalCost: 4.48,
					priceText: '$4.48'
        },
      },
      tracking: {
        tracking: "TBA123",
        carrier: "Amazon",
      },
    });
  });

  it("returns null if shipmentId is missing", async () => {
    const { extractShipmentId } = await import(
      "@/shipment/extract/extract-shipment-id"
    );

    (extractShipmentId as any).mockReturnValueOnce(null);

    const doc = loadHTML("order/111-6784099-6345037.html");
    const elem = doc.querySelector("#shipment")!;

    const result = await buildShipment(elem);

    expect(result).toBeNull();
  });
});

