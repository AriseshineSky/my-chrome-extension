// src/content/runtime/env.ts
const DOMAIN_BY_COUNTRY: Record<string, string> = {
  us: "amazon.com",
  uk: "amazon.co.uk",
  de: "amazon.de",
};

const COOKIE_BY_COUNTRY: Record<string, string> = {
  us: "x-main=",
  uk: "x-acbuk=",
  de: "x-acbde=",
};

export function getCurrentAmazonCountry(): string | null {
  return (
    Object.keys(DOMAIN_BY_COUNTRY).find(country =>
      location.href.includes(DOMAIN_BY_COUNTRY[country]),
    ) ?? null
  );
}

export function isLogged(country: string): boolean {
  const cookieKey = COOKIE_BY_COUNTRY[country];
  return cookieKey ? document.cookie.includes(cookieKey) : false;
}

