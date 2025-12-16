import { describe, it, expect, vi } from "vitest";
import { getTrackInfo, fetchTrackInfo } from "../content/tracking"
import { loadHTML } from "./utils";

vi.mock("../services/api", () => ({
  fetchInfo: vi.fn(async (url: string) => {
    return loadHTML("UJ9krSmsZ.html");
  }),
}));

describe("tracking.ts", () => {
  const htmlFiles = [
    "BfvmMMzbl.html",
    "Ug9qr1K6K.html",
    "UJ9krSmsZ.html",
    "UXfxScdLW.html",
  ];

  describe("getTrackInfo", () => {
    htmlFiles.forEach((file) => {
      it(`should parse tracking info from ${file}`, () => {
        const doc = loadHTML(file);
        const info = getTrackInfo(doc);
        console.log(file, info);

        expect(info).toHaveProperty("tracking");
        expect(info).toHaveProperty("carrier");
				expect(info).toHaveProperty("tracking");
				expect(info.tracking).toMatch(/^TBA|UK\d+/); // 匹配你提供的 Tracking ID 格式
				expect(info).toHaveProperty("carrier");
				expect(info.carrier).toBe("Amazon");
        expect(typeof info.tracking === "string" || info.tracking === null).toBe(true);
        expect(typeof info.carrier === "string" || info.carrier === null).toBe(true);
      });
    });
  });
});

