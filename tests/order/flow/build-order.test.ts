// tests/order/flow/build-order.test.ts
import { describe, it, expect, vi } from "vitest";
import { buildOrder } from "@/order/flow/build-order";

vi.mock("@/order/extract/extract-order-summary", () => ({
  extractOrderSummary: vi.fn(),
}));

vi.mock("@/order/flow/fetch-order-detail", () => ({
  fetchOrderDetail: vi.fn(),
}));

vi.mock("@/order/extract/extract-order-cost", () => ({
  extractOrderCost: vi.fn(),
}));

vi.mock("@/order/extract/extract-shipping-address", () => ({
  extractShippingAddress: vi.fn(),
}));

vi.mock("@/order/extract/extract-payment-method", () => ({
  extractPaymentMethod: vi.fn(),
}));

vi.mock("@/order/flow/build-shipments", () => ({
  buildShipments: vi.fn(),
}));

// ⬇️ 拿到 mock 实例
import { extractOrderSummary } from "@/order/extract/extract-order-summary";
import { fetchOrderDetail } from "@/order/flow/fetch-order-detail";
import { extractOrderCost } from "@/order/extract/extract-order-cost";
import { extractShippingAddress } from "@/order/extract/extract-shipping-address";
import { extractPaymentMethod } from "@/order/extract/extract-payment-method";
import { buildShipments } from "@/order/flow/build-shipments";

describe("buildOrder", () => {
  it("assembles us order from all extractors correctly", async () => {
    const fakeOrderCard = document.createElement("div");
    const fakeDetailDoc = document.implementation.createHTMLDocument("detail");

    // 👇 准备 mock 返回值
    (extractOrderSummary as any).mockReturnValue({
      orderNumber: "111-6784099-6345037",
      buyOrderDate: "June 12, 2025",
      shipTo: "Joy Z",
    });

    (fetchOrderDetail as any).mockResolvedValue(fakeDetailDoc);

    (extractOrderCost as any).mockReturnValue({
			subTotal: 4.48,
			shipping: 0,
			tax: 0.36,
			original_total: 4.84,
			original_currency: "USD",
			original_cost: 4.84,
			final_paid_usd: 4.84,
    });

    (extractShippingAddress as any).mockReturnValue(
      "2101 E TERRA LN, O FALLON, MO",
    );

    (extractPaymentMethod as any).mockReturnValue("AMEX ending in 2044");

    (buildShipments as any).mockResolvedValue(
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

    // 🚀 调用被测函数
    const order = await buildOrder(fakeOrderCard);

    expect(order).toEqual(
			{
				orderNumber: '111-6784099-6345037',
				buyOrderDate: 'June 12, 2025',
				shipTo: 'Joy Z',
				cost: {
					subTotal: 4.48,
					shipping: 0,
					tax: 0.36,
					original_currency: 'USD',
					original_cost: 4.84,
					usd_cost: 4.84,
					final_paid_usd: 4.84,
				 "payment_currency": undefined,
				 "payment_total": undefined,
					exchange_rate: 1,
				},
				address: '2101 E TERRA LN, O FALLON, MO',
				paymentMethod: 'AMEX ending in 2044',
				shipments: {
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
						shipmentId: 'BW5XJjGqd',
						status: 'Delivered',
			       "tracking": {
			         "carrier": "Amazon",
			         "tracking": "TBA123",
			       },

					}
				}
			}

    );
  });

  it("assembles order from all extractors correctly", async () => {
    const fakeOrderCard = document.createElement("div");
    const fakeDetailDoc = document.implementation.createHTMLDocument("detail");

    // 👇 准备 mock 返回值
    (extractOrderSummary as any).mockReturnValue({
      orderNumber: "123-4567890-1234567",
      buyOrderDate: "2024-01-01",
      shipTo: "Joy Z",
    });

    (fetchOrderDetail as any).mockResolvedValue(fakeDetailDoc);

    (extractOrderCost as any).mockReturnValue({
			"original_cost": 5.49,
			"original_currency": "GBP",
			"original_total": 5.49,
			"payment_currency": "USD",
			"payment_total": 7.56,
			"shipping": 0,
			"subTotal": 5.49,
			final_paid_usd: 7.56,
    });

    (extractShippingAddress as any).mockReturnValue(
      "2101 E TERRA LN, O FALLON, MO",
    );

    (extractPaymentMethod as any).mockReturnValue("AMEX ending in 2085");

    (buildShipments as any).mockResolvedValue(
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

    // 🚀 调用被测函数
    const order = await buildOrder(fakeOrderCard);

    expect(order).toEqual({
      orderNumber: "123-4567890-1234567",
      buyOrderDate: "2024-01-01",
      shipTo: "Joy Z",
			"address": "2101 E TERRA LN, O FALLON, MO",
			"paymentMethod": "AMEX ending in 2085",
			cost: {
				subTotal: 5.49,
				shipping: 0,
				tax: 0,
				original_currency: 'GBP',
				original_cost: 5.49,
				usd_cost: 7.56,
				exchange_rate: 1.377049,
				payment_currency: 'USD',
				payment_total: 7.56,
				final_paid_usd: 7.56,
			},

			shipments: {
 				"BW5XJjGqd": {
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
 				},
 			},
    });

    expect(fetchOrderDetail).toHaveBeenCalledWith(fakeOrderCard);
    expect(buildShipments).toHaveBeenCalledWith(fakeDetailDoc);
  });

  it("assembles order from  no tax shipping all extractors correctly", async () => {
    const fakeOrderCard = document.createElement("div");
    const fakeDetailDoc = document.implementation.createHTMLDocument("detail");

    // 👇 准备 mock 返回值
    (extractOrderSummary as any).mockReturnValue({
      orderNumber: "123-4567890-1234567",
      buyOrderDate: "2024-01-01",
      shipTo: "Joy Z",
    });

    (fetchOrderDetail as any).mockResolvedValue(fakeDetailDoc);

    (extractOrderCost as any).mockReturnValue({
			"original_cost": 5.49,
			"original_currency": "GBP",
			"original_total": 5.49,
			"payment_currency": "USD",
			"payment_total": 7.56,
			"subTotal": 5.49,
			final_paid_usd: 7.56,
    });

    (extractShippingAddress as any).mockReturnValue(
      "2101 E TERRA LN, O FALLON, MO",
    );

    (extractPaymentMethod as any).mockReturnValue("AMEX ending in 2085");

    (buildShipments as any).mockResolvedValue(
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

    // 🚀 调用被测函数
    const order = await buildOrder(fakeOrderCard);

    expect(order).toEqual({
      orderNumber: "123-4567890-1234567",
      buyOrderDate: "2024-01-01",
      shipTo: "Joy Z",
			"address": "2101 E TERRA LN, O FALLON, MO",
			"paymentMethod": "AMEX ending in 2085",
			cost: {
				subTotal: 5.49,
				original_currency: 'GBP',
				original_cost: 5.49,
				usd_cost: 7.56,
				exchange_rate: 1.377049,
				payment_currency: 'USD',
				payment_total: 7.56,
				final_paid_usd: 7.56,
				tax: 0,
				shipping: 0
			},

			shipments: {
 				"BW5XJjGqd": {
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
 				},
 			},
    });

    expect(fetchOrderDetail).toHaveBeenCalledWith(fakeOrderCard);
    expect(buildShipments).toHaveBeenCalledWith(fakeDetailDoc);
  });
});

