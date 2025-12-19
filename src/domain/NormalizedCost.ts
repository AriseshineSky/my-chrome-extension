// src/domain/NormalizedCost.ts
export interface NormalizedCost {
  subTotal?: number;
  tax?: number;
  shipping?: number;

  usd_cost: number;
  exchange_rate: number;
  exchange_rate_source: string;

  original_currency?: string;
  original_cost?: number;

  payment_currency?: string;
  payment_total?: number;
}

