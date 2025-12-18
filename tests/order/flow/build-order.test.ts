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
      cost: {
        original_cost: 100,
        original_currency: "USD",
        usd_cost: 100,
        exchange_rate: 1,
      },
    });

    (extractShippingAddress as any).mockReturnValue(
      "2101 E TERRA LN, O FALLON, MO",
    );

    (extractPaymentMethod as any).mockReturnValue("AMEX ending in 2044");

    (buildShipments as any).mockResolvedValue({
      s1: { shipmentId: "s1" },
    });

    // 🚀 调用被测函数
    const order = await buildOrder(fakeOrderCard);

    expect(order).toEqual({
      orderNumber: "123-4567890-1234567",
      buyOrderDate: "2024-01-01",
      shipTo: "Joy Z",

      cost: {
        original_cost: 100,
        original_currency: "USD",
        usd_cost: 100,
        exchange_rate: 1,
      },

      address: "2101 E TERRA LN, O FALLON, MO",
      paymentMethod: "AMEX ending in 2044",

      shipments: {
        s1: { shipmentId: "s1" },
      },
    });

    // 🧠 可选：验证调用链
    expect(fetchOrderDetail).toHaveBeenCalledWith(fakeOrderCard);
    expect(buildShipments).toHaveBeenCalledWith(fakeDetailDoc);
  });
});

