import fs from "fs";
import path from "path";

export function loadHTML(relativePath: string): Document {
  const filePath = path.resolve(
    __dirname,
    "..",
    "fixtures",
    relativePath
  );

  const html = fs.readFileSync(filePath, "utf-8");
  return new DOMParser().parseFromString(html, "text/html");
}

