import fs from "fs";
import path from "path";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { getShipments } from "../content/shipment";

vi.mock("../content/order-item", () => ({
  getOrderItems: vi.fn((shipmentElem) => {
    return [{ sku: "TESTSKU", qty: 1 }];
  }),
}));

vi.mock("../content/tracking", () => ({
	fetchTrackInfo: vi.fn(async () => ({
    tracking: "TEST123456",
    carrier: "Delivery by Amazon",
  })),
}));

function loadHTML(filename: string) {
  const filepath = path.join(__dirname, "html-fixtures", filename);
  const html = fs.readFileSync(filepath, "utf-8");
  const parser = new DOMParser();
  return parser.parseFromString(html, "text/html");
}

const FIXTURE_FILES = [
  // { file: "112-3905152-4244227.html", shipmentId: null },
  // { file: "112-6514990-7723409.html", shipmentId: null },
  // { file: "113-7980148-9917858.html", shipmentId: null },
  { file: "111-6784099-6345037.html", shipmentId: "BW5XJjGqd" },
  { file: "112-5975653-8865058.html", shipmentId: "B7V90j3gd" },
  { file: "113-9672161-1279446.html", shipmentId: "BhqfS9VVd" },
];

describe("getShipments", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
	for (const { file, shipmentId } of FIXTURE_FILES) {
		it(`should extract shipments from ${file}`, async () => {
			const doc = loadHTML(file);
			const shipments = await getShipments(doc);

			expect(shipments).toHaveProperty(shipmentId);
		});
	}
});

