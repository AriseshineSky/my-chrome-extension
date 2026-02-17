import {
	ShippedWithStrategy, AmazonCarrierStrategy, SpanishTrackingStrategy, SpanishCarrierStrategy,
	EnglishTrackingStrategy, DeliveryByStrategy
} from "./TrackingStrategy";

const trackingStrategies = [
  new EnglishTrackingStrategy(),
  new SpanishTrackingStrategy(),
];

const carrierStrategies = [
  new AmazonCarrierStrategy(),
  new ShippedWithStrategy(),
	new SpanishCarrierStrategy(),
	new DeliveryByStrategy(),
];

export function extractTrackInfoFromText(
  trackNoStr: string | null,
  carrierStr: string | null,
) {
  let tracking: string | null = null;
  let carrier: string | null = null;

  if (trackNoStr) {
    for (const strategy of trackingStrategies) {
      if (strategy.match(trackNoStr)) {
        tracking = strategy.extract(trackNoStr);
        break;
      }
    }
  }

  if (carrierStr) {
    for (const strategy of carrierStrategies) {
      if (strategy.match(carrierStr)) {
        carrier = strategy.extract(carrierStr);
        break;
      }
    }
    carrier ??= carrierStr.trim();
  }

  return { tracking, carrier };
}

