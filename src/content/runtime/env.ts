// src/content/runtime/env.ts
const DOMAIN_BY_COUNTRY: Record<string, string> = {
	mx: "amazon.com.mx",
  uk: "amazon.co.uk",
  de: "amazon.de",
	ca: "amazon.ca",
  us: "amazon.com",
};

const COOKIE_BY_COUNTRY: Record<string, string> = {
  us: "x-main=",
  uk: "x-acbuk=",
  de: "x-acbde=",
  mx: "x-acbmx=",
  ca: "x-acbca=",
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

export function buildContext(): { domain?: string, country?: string } {
	const country = getCurrentAmazonCountry() ?? undefined;
  const domain = country ? DOMAIN_BY_COUNTRY[country] : undefined;
  return { domain, country };
}
