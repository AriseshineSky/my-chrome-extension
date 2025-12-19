// src/persistence/to-order-record.test.ts
import { describe, it, expect, vi } from "vitest";
import { buildOrder } from "@/order/flow/build-order";
import { Order } from "@/domain/Order";
// src/persistence/__tests__/to-order-record.spec.ts
import { toOrderRecord } from "@/persistence/to-order-record";

describe("toOrderRecord", () => {
  it("maps Order domain object to persistence record correctly", () => {

    const fakeOrder = {
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

    const record = toOrderRecord(fakeOrder, "test@example.com");

    expect(record).toEqual(
			{
				user_email: 'test@example.com',
				order_number: '111-6784099-6345037',
				buy_order_date: 'June 12, 2025',
				ship_to: 'Joy Z',
				address: '2101 E TERRA LN, O FALLON, MO',
				payment_method: 'AMEX ending in 2044',
				sub_total: 4.48,
				shipping: 0,
				tax: 0.36,
				original_currency: 'USD',
				original_cost: 4.84,
				usd_cost: 4.84,
				final_paid_usd: 4.84,
				exchange_rate: 1,
				payment_currency: undefined,
				payment_total: undefined,
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
});


