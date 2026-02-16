// tests/helpers/map-extracted-to-normalized.ts
export function mapExtractedItemsToNormalized(
  extracted: Record<string, any>,
  domain: string
) {
  return {
    shipmentId: "TEST",
    status: "Delivered",
    tracking: null,
    items: extracted,
  };
}

