// src/content/runtime/user.ts
import { fetchInfo } from "../../services/api";

export interface User {
  name: string;
  email: string;
}

function getFullUrl(path: string) {
  return new URL(path, location.origin).href;
}

export async function loadUser(): Promise<User | null> {
  const cached = localStorage.getItem("user");
  if (cached) {
    const user = JSON.parse(cached);
    if (user?.email) return user;
  }

  try {
    const doc = await fetchInfo(getFullUrl("/ax/account/manage"));
    const name = doc.querySelector("#NAME_SUBTITLE")?.textContent?.trim();
    const email = doc.querySelector("#EMAIL_SUBTITLE")?.textContent?.trim();

    if (name && email) {
      const user = { name, email };
      localStorage.setItem("user", JSON.stringify(user));
      return user;
    }
  } catch {}

  return null;
}

