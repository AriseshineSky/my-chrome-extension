import { describe, it, expect } from "vitest";
import { extractTrackInfoFromText } from "@/tracking/extract/extract-track-text";

describe("extractTrackInfoFromText", () => {
  it("parses Amazon tracking ID", () => {
    const result = extractTrackInfoFromText(
      "Tracking ID: TBA123456789",
      "Amazon Logistics",
    );

    expect(result).toEqual({
      tracking: "TBA123456789",
      carrier: "Amazon",
    });
  });

  it("parses UK carrier tracking", () => {
    const result = extractTrackInfoFromText(
      "Tracking ID: UK12345678",
      "Shipped with Royal Mail",
    );

    expect(result.tracking).toBe("UK12345678");
    expect(result.carrier).toBe("Royal Mail");
  });

  it("returns nulls when text missing", () => {
    const result = extractTrackInfoFromText(null, null);
    expect(result).toEqual({ tracking: null, carrier: null });
  });
});

