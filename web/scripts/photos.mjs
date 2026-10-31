import { readFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";
import path from "node:path";
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
try { process.loadEnvFile(path.join(root, ".env.photos-admin.local")); } catch {}
const [action, id, fileOrReason] = process.argv.slice(2);
if (!["publish", "remove", "check"].includes(action) || !id || (action !== "check" && !fileOrReason)) {
  console.error('Usage: npm run photos -- check <photo-id> | publish <photo-id> <reviewed-local-file> | remove <photo-id> "reason"'); process.exit(1);
}
const manifest = JSON.parse(await readFile(path.join(root, "data/photos.json"), "utf8"));
const photo = manifest.photos.find((entry) => entry.id === id);
if (!photo) throw new Error("Unknown photo ID");
if (!process.env.PHOTO_ADMIN_TOKEN) throw new Error("PHOTO_ADMIN_TOKEN missing; see the photo operations guide");
const body = { action, photo_id: id };
if (action === "publish") {
  const bytes = await readFile(path.resolve(fileOrReason));
  if (createHash("sha256").update(bytes).digest("hex") !== photo.sha256) throw new Error("File does not match the reviewed manifest");
  body.image_base64 = bytes.toString("base64");
} else if (action === "remove") body.reason = fileOrReason;
const origin = "https://toydistrictlosangeles.com";
const response = await fetch(`${origin}/api/admin/photos`, { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${process.env.PHOTO_ADMIN_TOKEN}` }, body: JSON.stringify(body) });
const result = await response.json();
console.log(JSON.stringify({ status: response.status, ...result }));
if (!response.ok) process.exit(1);
if (action === "check") process.exit(0);
const check = await fetch(`${origin}/api/store-photos/${id}`, { cache: "no-store" });
const expected = action === "remove" ? 410 : 200;
if (check.status !== expected) throw new Error(`Verification failed: expected ${expected}, received ${check.status}`);
console.log(`Verified ${id}: HTTP ${check.status}.`);
