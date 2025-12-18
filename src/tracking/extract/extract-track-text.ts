import { TrackingInfo } from "../../domain/Tracking";

export function extractTrackInfoFromText(
  trackNoStr: string | null,
  carrierStr: string | null,
): TrackingInfo {
  let tracking: string | null = null;
  let carrier: string | null = null;

  if (trackNoStr) {
    const match = trackNoStr.match(/Tracking\s*ID:\s*(\S+)/i);
    tracking = match ? match[1] : null;
  }

  if (carrierStr) {
    const text = carrierStr.trim();

    if (/amazon/i.test(text)) {
      carrier = "Amazon";
    } else if (/shipped with/i.test(text)) {
      carrier = text.replace(/shipped with/i, "").trim();
    } else if (/delivery by/i.test(text)) {
      carrier = text.replace(/delivery by/i, "").trim();
    } else {
      carrier = text;
    }
  }

  return { tracking, carrier };
}

