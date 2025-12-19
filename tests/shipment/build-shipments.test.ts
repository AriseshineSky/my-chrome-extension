import { describe, it, expect, vi } from "vitest";
import { buildShipments } from "@/shipment/flow/build-shipments";
import { loadHTML } from "../utils/load-html";
vi.mock("@/shipment/flow/build-shipment", () => ({
  buildShipment: vi.fn(async (elem) => {
    return({
      shipmentId: "BW5XJjGqd",
      status: "Delivered",
      items: {
        B06XYNHFF2: {
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
  }),
}));

describe("buildShipments", () => {
  it("builds shipments object correctly", async () => {
    const doc = loadHTML("order/111-6784099-6345037.html");

    const result = await buildShipments(doc);
		console.log(result)

    expect(result).toEqual(
			{
				BW5XJjGqd: {
				 "items": {
					 "B06XYNHFF2": {
						 "asin": "B06XYNHFF2",
						 "originalCost": 4.48,
						 "originalCurrency": "USD",
						 "originalPrice": 4.48,
						 "priceText": "$4.48",
						 "quantity": 1,
					 },
				 },
				 "shipmentId": "BW5XJjGqd",
				 "status": "Delivered",
				 "tracking": {
					 "carrier": "Amazon",
					 "tracking": "TBA123",
				 },
			 }
			}
		);
	});
});

