import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const COLLECTION_URL =
  "https://docs.infakt.pl/api/collections/4951438/2s8ZDa31yd?environment=23910695-e9bb3dd3-461d-479a-9b12-1bd03332ce35&segregateAuth=true&versionTag=latest";

const __dirname = dirname(fileURLToPath(import.meta.url));
const outputPath = join(__dirname, "../postman/collection.json");

const sync = async () => {
  const response = await fetch(COLLECTION_URL);

  if (!response.ok) {
    throw new Error(`Failed to download collection: HTTP ${response.status}`);
  }

  const json = await response.text();
  mkdirSync(dirname(outputPath), { recursive: true });
  writeFileSync(outputPath, json);

  console.log(`Saved Postman collection (${json.length} bytes) to ${outputPath}`);
};

sync().catch((error) => {
  console.error(error);
  process.exit(1);
});
