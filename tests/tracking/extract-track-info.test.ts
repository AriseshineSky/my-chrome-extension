import { describe, it, expect } from "vitest";
import { extractTrackInfo } from "@/tracking/extract/extract-track-info";
import { loadHTML } from "../utils/load-html";
import { EXPECTED_TRACK_INFO } from "../fixtures/tracking/expected-track-info";

describe("extractTrackInfo (real HTML fixtures)", () => {
  Object.entries(EXPECTED_TRACK_INFO).forEach(
    ([file, expected]) => {
      it(`extracts tracking info from ${file}`, () => {
        const doc = loadHTML(file);
        const actual = extractTrackInfo(doc);

        expect(actual).toEqual(expected);
      });
    },
  );
});

