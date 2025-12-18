// src/content/runtime/run-once.ts
import { sendClickLog } from "../../services/api";
import { syncOrders } from "../../order";
import { isTaskRunning, refreshTaskTTL, clearTask } from "./task";
import { getCurrentAmazonCountry, isLogged } from "./env";
import { loadUser } from "./user";

function ensureDomReady(): Promise<void> {
  if (document.readyState === "interactive" || document.readyState === "complete") {
    return Promise.resolve();
  }
  return new Promise(resolve =>
    document.addEventListener("DOMContentLoaded", () => resolve(), { once: true }),
  );
}

export async function runOnce() {
  if (!isTaskRunning()) return;

  await ensureDomReady();
  refreshTaskTTL();

  const country = getCurrentAmazonCountry();
  if (!country || !isLogged(country)) {
    clearTask();
    return;
  }

  const user = await loadUser();
  if (!user) {
    clearTask();
    return;
  }

  sendClickLog(user.email);

  try {
    const isDone = await syncOrders(user);
    if (isDone) clearTask();
    else refreshTaskTTL();
  } catch (err) {
    console.error("Order fetch failed:", err);
    clearTask();
  }
}

