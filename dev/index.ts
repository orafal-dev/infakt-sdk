/**
 * Local dev playground — imports SDK from ../src (no build / npm publish needed).
 * Bun loads .env from the project root automatically.
 *
 * Usage:
 *   bun run dev
 *   bun run dev clients list
 *   bun run dev invoices get <uuid>
 */
import {
  InfaktClient,
  createInfaktModules,
  type ResourceAction,
  type ResourceName,
} from "../src/index.js";
import { loadDevEnv } from "./load-env.js";

const printUsage = () => {
  console.log(`
inFakt SDK dev playground (source mode)

  bun run dev                          smoke test: clients + invoices list
  bun run dev <resource> list            e.g. clients list
  bun run dev <resource> get <id>        e.g. invoices get <uuid>
  bun run dev <resource> <action> [id]   any action from the Postman collection

Requires .env with INFAKT_API_KEY (optional: INFAKT_BASE_URL for sandbox)
`.trim());
};

const printJson = (label: string, value: unknown) => {
  console.log(`\n── ${label} ──`);
  console.log(JSON.stringify(value, null, 2));
};

const runSmokeTest = async (api: ReturnType<typeof createInfaktModules>) => {
  console.log("Running smoke test (read-only)…\n");

  const clients = await api.resource("clients").list({ limit: 3, offset: 0 });
  printJson("clients.list (limit 3)", {
    metainfo: clients.metainfo,
    data: clients.data,
  });

  const invoices = await api.resource("invoices").list({ limit: 3, offset: 0 });
  printJson("invoices.list (limit 3)", {
    metainfo: invoices.metainfo,
    data: invoices.data,
  });

  console.log("\nSmoke test finished.");
};

const runCli = async (
  api: ReturnType<typeof createInfaktModules>,
  args: string[],
) => {
  if (args.length === 0) {
    await runSmokeTest(api);
    return;
  }

  if (args[0] === "help" || args[0] === "--help" || args[0] === "-h") {
    printUsage();
    return;
  }

  const [resource, action, id] = args;
  if (!resource || !action) {
    printUsage();
    process.exit(1);
  }

  const client = api.resource(resource as ResourceName);
  const response = await client.invoke(action as ResourceAction, {
    id: id !== undefined ? id : undefined,
    query: action === "list" ? { limit: 5, offset: 0 } : undefined,
  });

  printJson(`${resource}.${action}${id ? ` ${id}` : ""}`, {
    statusCode: response.statusCode,
    metainfo: response.metainfo,
    data: response.data,
  });
};

const main = async () => {
  const args = Bun.argv.slice(2);

  if (args.includes("--help") || args.includes("-h") || args[0] === "help") {
    printUsage();
    return;
  }

  const env = loadDevEnv();
  const client = new InfaktClient({
    credentials: { apiKey: env.apiKey },
    baseUrl: env.baseUrl,
  });

  const api = createInfaktModules(client);

  console.log("inFakt SDK dev");
  console.log(`  baseUrl: ${client.baseUrl}`);
  console.log(`  source:  ../src (no dist build)\n`);

  try {
    await runCli(api, args);
  } catch (error) {
    console.error("\nRequest failed:");
    if (error instanceof Error) {
      console.error(error.message);
      if ("statusCode" in error && error.statusCode) {
        console.error(`  status: ${String(error.statusCode)}`);
      }
      if ("rawBody" in error && typeof error.rawBody === "string") {
        console.error("\nRaw response:\n", error.rawBody.slice(0, 2000));
      }
    } else {
      console.error(error);
    }
    process.exit(1);
  }
};

main();
