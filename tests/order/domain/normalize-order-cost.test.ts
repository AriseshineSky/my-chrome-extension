import { describe, it, expect } from "vitest";
import { normalizeOrderCost } from "@/order/domain/normalize-order-cost";
import { EXPECTED_ORDER_INFO } from "../../fixtures/order/expected-order-cost";

describe("normalizeOrderCost", () => {
  Object.entries(EXPECTED_ORDER_INFO).forEach(([file, raw]) => {
    it(`normalizes order cost for ${file}`, () => {
      const result = normalizeOrderCost(raw);

      // 1️⃣ 基础字段必须透传
      expect(result.subTotal).toBe(raw.subTotal ?? 0);
      expect(result.shipping).toBe(raw.shipping ?? 0);
      expect(result.tax).toBe(raw.tax ?? 0);

      expect(result.original_currency).toBe(raw.original_currency);
      expect(result.original_cost).toBe(raw.original_cost);

      // 2️⃣ final_paid_usd 一定存在且为 number
      expect(result.final_paid_usd).toBeTypeOf("number");
      expect(result.final_paid_usd).toBeGreaterThan(0);

      // 3️⃣ USD 场景
      if (raw.original_currency === "USD" && !raw.payment_total) {
        expect(result.final_paid_usd).toBe(raw.original_cost);
        expect(result.exchange_rate).toBe(1);
      }

      // 4️⃣ ACC 场景（外币 → USD）
      if (raw.payment_currency === "USD" && raw.payment_total) {
        expect(result.final_paid_usd).toBe(raw.payment_total);

        const expectedRate =
          raw.original_currency === "USD"
            ? 1
            : Number(
                (raw.payment_total / raw.original_cost).toFixed(6),
              );

        expect(result.exchange_rate).toBeCloseTo(expectedRate, 6);
      }

      // 5️⃣ 兜底完整性检查
      expect(result.usd_cost).toBe(result.final_paid_usd);
    });
  });
});

