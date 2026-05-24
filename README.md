# infakt-sdk

[![npm version](https://img.shields.io/npm/v/infakt-sdk)](https://www.npmjs.com/package/infakt-sdk)

TypeScript SDK for the [inFakt.pl API](https://docs.infakt.pl/), generated from the official Postman collection.

## Installation

```bash
npm install infakt-sdk
```

## Authentication

Generate an API key in inFakt: **Settings → API**. Pass it in the `X-inFakt-ApiKey` header ([docs](https://docs.infakt.pl/)).

```typescript
import { InfaktClient, createInfaktModules } from "infakt-sdk";

const client = new InfaktClient({
  credentials: {
    apiKey: process.env.INFAKT_API_KEY!,
  },
});

const api = createInfaktModules(client);
```

### Sandbox

Use the sandbox base URL for testing:

```typescript
import { InfaktClient, SANDBOX_BASE_URL, createInfaktModules } from "infakt-sdk";

const client = new InfaktClient({
  credentials: { apiKey: process.env.INFAKT_API_KEY! },
  baseUrl: SANDBOX_BASE_URL,
});
```

Register at [konto.sandbox-infakt.pl](https://konto.sandbox-infakt.pl/rejestracja) and generate a sandbox API key.

## Usage

### Standard REST resources

```typescript
// List clients with pagination
const clients = await api.resource("clients").list({ limit: 20, offset: 0 });

// Get, create, update, delete
const client = await api.resource("clients").get("uuid-here");
await api.resource("clients").create({ company_name: "Acme Sp. z o.o." });
await api.resource("clients").update("uuid-here", { company_name: "New Name" });
await api.resource("clients").delete("uuid-here");

// Invoices
const invoices = await api.resource("invoices").list({ limit: 10 });
const pdf = await api.resource("invoices").invoke("pdf", { id: "invoice-uuid" });
```

### Any endpoint from the Postman collection

All resources from [docs.infakt.pl](https://docs.infakt.pl/) are available via `resource()`:

```typescript
await api.resource("products").list({ limit: 20 });
await api.resource("bank_accounts").list();
await api.resource("vat_rates").list();
await api.resource("invoices").invoke("next_number", { query: { kind: "vat" } });
await api.resource("invoices").invoke("share_links", { id: "uuid", body: {} });
await api.resource("async/invoices").invoke("create", { body: { /* invoice */ } });
```

Supported resources include `clients`, `invoices`, `products`, `bank_accounts`, `advance_invoices`, `corrective_invoices`, `documents/costs`, `ksef/integration`, and more. Run `bun run generate:modules` after syncing the collection to refresh definitions.

### Filtering and field selection

```typescript
await api.resource("clients").list({
  limit: 50,
  offset: 0,
  order: "company_name asc",
  fields: "company_name,nip",
  q: { nip_eq: "5252525252" },
});
```

## JSON payloads

The API uses JSON. The SDK wraps create/update payloads in the correct singular key automatically (`client`, `invoice`, `product`, etc.). Pass a plain object to `create()` / `update()`; for full control, pass a raw JSON string as `body` to `client.request()`.

## Development

Built with [Vite](https://vite.dev/) library mode (ESM + CJS). This project uses [Bun](https://bun.sh/) for installs, scripts, and running TypeScript tooling.

### Local playground (no build / npm publish)

Copy `.env.example` to `.env` and set `INFAKT_API_KEY`. Bun loads `.env` automatically.

```bash
bun install
bun run dev                    # smoke test (read-only list calls)
bun run dev clients list
bun run dev invoices get <uuid>
```

### Sync Postman collection

```bash
bun run sync:postman           # download latest from docs.infakt.pl
bun run generate:modules       # regenerate src/modules/resources.generated.ts
bun run build
```

### Scripts

| Script | Description |
|--------|-------------|
| `bun run dev` | Live API playground against `../src` |
| `bun test` | Unit tests (mock fetch) |
| `bun run typecheck` | TypeScript check |
| `bun run build` | Generate modules + Vite library build |

## License

MIT
