// src/content/index.ts
import { runOnce } from "./runtime/run-once";
import { initMessageListener } from "./runtime/listener";

export function initContentScript() {
  runOnce();
  initMessageListener();
}

