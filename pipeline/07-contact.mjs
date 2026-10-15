// Rebuild reviewed contacts from the committed baseline, without a registry
// network refresh. Removing an overlay removes its generated values and labels.
// Raw contacts.json is a research queue, never an instruction to publish.
import fs from "node:fs";
import { z } from "zod";
import { loadReviewedData, readBaselineStores, assertBaselineInventory } from "./reviewed-data.mjs";
import { StoreSchema } from "./store-schema.mjs";
const file = new URL("../web/data/stores.json", import.meta.url);
const baseline = readBaselineStores();
if (fs.existsSync(file)) assertBaselineInventory(JSON.parse(fs.readFileSync(file, "utf8")).stores, baseline);
const stores = z.array(StoreSchema).parse(loadReviewedData(baseline));
console.log(`Reviewed directory: ${stores.length} stores`);
if (process.argv.includes("--dry")) console.log("Dry run: stores.json not written");
else fs.writeFileSync(file, `${JSON.stringify({ generated_note: "built by pipeline/, do not edit by hand", stores }, null, 2)}\n`);
