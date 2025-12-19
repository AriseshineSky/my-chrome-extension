// src/domain/OrderItem.ts
export interface OrderItem {
  asin: string;
  quantity: number;
  originalPrice: number;
  originalCurrency: string | null;
  originalCost: number;
	priceText: string;
}

