# Amazon Order Collect

Chrome MV3 extension that scrapes Amazon order history (list → detail → shipment → tracking) and uploads structured order data to EveryMarket.

Supports **US / UK / DE / MX / CA** marketplaces.

## Requirements

- Node.js 18+
- [pnpm](https://pnpm.io/) (preferred; `npm` also works)
- Chrome / Chromium

## Setup

```bash
pnpm install
```

Before shipping, set the API token in `src/services/api.ts` (`API_TOKEN`) to a real value. The default placeholder will not authenticate against production.

## Develop

```bash
pnpm dev
```

Vite serves the popup with HMR. Content/background scripts still need a full build to load in Chrome.

## Build

```bash
pnpm build
```

Output goes to `build/`. Load the extension:

1. Open `chrome://extensions`
2. Enable **Developer mode**
3. **Load unpacked** → select the `build/` directory

## Usage

1. Sign in to Amazon on the target marketplace (e.g. `amazon.com`, `amazon.ca`)
2. Open **Your Orders** / order history
3. Click the extension icon → **Fetch Orders**

The content script waits for the orders page to hydrate, walks order cards page by page, fetches each order detail (items, cost, payment, address, tracking), and posts records to the EveryMarket API.

## Tests

Tests use [Vitest](https://vitest.dev/) + jsdom against HTML fixtures under `tests/fixtures/`.

```bash
# all tests
npx vitest run

# focused suites (recommended while iterating on extractors)
npx vitest run tests/order/extract tests/tracking/extract-track-info.test.ts
```

Some legacy suites under `tests/*.test.ts` still import removed paths and may fail; prefer the suites under `tests/order/`, `tests/shipment/`, and `tests/tracking/`.

## Project layout

```
src/
  background/          # service worker (popup ↔ content messaging)
  content/             # content-script entry + runtime (task TTL, login/env)
  order/               # list, extract, build, save, pagination
  shipment/            # shipment extract + normalize
  tracking/            # tracking page fetch + parse
  money/               # parse money, FX, normalize costs
  domain/              # Order / Shipment / Tracking types
  persistence/         # domain → API payload mappers
  services/api.ts      # EveryMarket HTTP client
  manifest.json        # MV3 manifest (copied into build/)
tests/
  fixtures/            # saved Amazon HTML (us/uk/mx/ca/…)
  order|shipment|tracking/  # extractor & flow tests
```

## Scripts

| Command        | Description              |
|----------------|--------------------------|
| `pnpm dev`     | Vite dev server (popup)  |
| `pnpm build`   | Typecheck + production build → `build/` |
| `pnpm lint`    | ESLint                   |
| `npx vitest run` | Run unit/integration tests |

## Notes

- Build uses inline source maps and disables minify for easier debugging in Chrome.
- Order sync stops when orders are older than the configured expiry window (`is-order-expired`).
- Root-level scraped HTML dumps and `build.zip` are local debug artifacts; do not commit them.
