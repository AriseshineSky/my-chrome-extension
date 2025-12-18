// tests/utils.ts
import fs from "fs";
import path from "path";

export function loadHTML(filename: string): Document {
  const filePath = path.resolve(__dirname, "html-fixtures", filename);
  const html = fs.readFileSync(filePath, "utf-8");
  const parser = new DOMParser();
  return parser.parseFromString(html, "text/html");
}

