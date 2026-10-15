// Validate/finalize a registry refresh while preserving reviewed enrichment.
import fs from "node:fs";
import { readOut } from "./lib.mjs";
import { buildStores } from "./build-stores.mjs";

const parsed = buildStores(readOut("enriched.json"));
if (!process.argv.includes("--dry")) {
  fs.mkdirSync(new URL("../web/data/", import.meta.url), { recursive: true });
  fs.writeFileSync(
    new URL("../web/data/stores.json", import.meta.url),
    `${JSON.stringify({ generated_note: "built by pipeline/, do not edit by hand", stores: parsed }, null, 2)}\n`,
  );
}
console.log(`web/data/stores.json: ${parsed.length} stores`);
console.log("confidence:", parsed.reduce((acc, s) => ((acc[s.confidence] = (acc[s.confidence] || 0) + 1), acc), {}));
