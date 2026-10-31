import test, { type TestContext } from "node:test";
import assert from "node:assert/strict";
import { limitedJson, sameOrigin, validPhotoReport } from "../lib/request-validation";
import { GET } from "../app/api/store-photos/[id]/route";
import { POST as reportPhoto } from "../app/api/photo-reports/route";
import { POST as administerPhoto } from "../app/api/admin/photos/route";
import { photos } from "../lib/photos";
import { privateFiles, checkPrivateStorage } from "../lib/server/private-files";
import { photoBlockPath } from "../lib/server/photo-service";
import { POST as submitInquiry } from "../app/api/leads/route";

const origin = "https://toydistrictlosangeles.com";
const photo = photos[0];
function request(path: string, body: unknown, requestOrigin = origin) { return new Request(`${origin}${path}`, { method: "POST", headers: { "Content-Type": "application/json", Origin: requestOrigin }, body: JSON.stringify(body) }); }

test("report validation rejects cross-origin, malformed, automated and incomplete submissions", async () => {
  assert.equal(sameOrigin(request("/api/photo-reports", {}, "https://unrelated.example")), false);
  assert.equal(await limitedJson(request("/api/photo-reports", [])), null);
  assert.equal(await limitedJson(request("/api/photo-reports", { data: "x".repeat(13000) })), null);
  assert.equal(validPhotoReport({ name: "Owner", reason: "Please remove my photograph", rights_holder: "no" }), null);
  assert.equal(validPhotoReport({ name: "Owner", reason: "Please remove my photograph", rights_holder: "yes", website: "spam" }), null);
  assert.equal(validPhotoReport({ name: "Owner", contact: "not-an-email", reason: "Please remove my photograph", rights_holder: "yes" }), null);
  assert.ok(validPhotoReport({ name: "Owner", reason: "Please remove my photograph", rights_holder: "yes" }));
  assert.equal((await reportPhoto(request("/api/photo-reports", {}, "https://unrelated.example"))).status, 403);
  assert.equal((await administerPhoto(request("/api/admin/photos", { action: "publish", photo_id: photo.id }))).status, 401);
});

function mockStorage(context: TestContext) {
  const files = new Map<string, Buffer>([[photo.storage_path, Buffer.from([255, 216, 255, 217])]]);
  const state = { downloads: 0, writes: 0, failReads: false, failDelete: false, failBlockWrite: false, failInboxWrite: false, raceRemoval: false };
  context.mock.method(globalThis, "fetch", async () => { throw new Error("Tests must never contact a real service"); });
  context.mock.method(privateFiles, "read", async (path: string) => {
    if (state.failReads) throw new Error("unavailable");
    if (path === photo.storage_path) { state.downloads++; if (state.raceRemoval) files.set(photoBlockPath(photo), Buffer.from("{}")); }
    return files.get(path) ?? null;
  });
  context.mock.method(privateFiles, "write", async (path: string, bytes: string | Buffer) => {
    if ((state.failBlockWrite && path.startsWith("photo-blocks/")) || (state.failInboxWrite && path.startsWith("photo-requests/"))) throw new Error("unavailable");
    state.writes++; files.set(path, Buffer.from(bytes));
  });
  context.mock.method(privateFiles, "remove", async (path: string) => { if (state.failDelete) throw new Error("unavailable"); files.delete(path); });
  return { files, state };
}
const getPhoto = () => GET(new Request(`${origin}/api/store-photos/${photo.id}`), { params: Promise.resolve({ id: photo.id }) });
const payload = { photo_id: photo.id, name: "Test owner", reason: "Test photo removal request", rights_holder: "yes", locale: "en" };

test("permanent suppression survives file deletion failure and private-inbox cleanup; repeated reports are idempotent", async (context) => {
  const { files, state } = mockStorage(context); state.failDelete = true;
  const before = await getPhoto(); assert.equal(before.status, 200); assert.match(before.headers.get("cache-control")!, /no-store/); assert.match(before.headers.get("x-robots-tag")!, /noimageindex/);
  const removed = await reportPhoto(request("/api/photo-reports", payload)); assert.equal(removed.status, 200); assert.equal((await removed.json()).hidden, true);
  assert.ok(files.has(photoBlockPath(photo))); assert.ok(files.has(photo.storage_path));
  const audit = [...files].find(([path]) => path.startsWith("photo-audits/")); assert.equal(JSON.parse(audit![1].toString()).bytes_removed, false);
  for (const path of files.keys()) if (path.startsWith("photo-requests/")) files.delete(path);
  assert.equal((await getPhoto()).status, 410); assert.equal(state.downloads, 1);
  const previousWrites = state.writes;
  assert.equal((await reportPhoto(request("/api/photo-reports", payload))).status, 200); assert.equal(state.writes, previousWrites);
  state.failReads = true; assert.equal((await getPhoto()).status, 503);
  assert.equal((await GET(new Request(`${origin}/api/store-photos/missing`), { params: Promise.resolve({ id: "missing" }) })).status, 404);
});

test("suppression storage failure never claims success; private request storage failure does not undo a successful takedown", async (context) => {
  const { files, state } = mockStorage(context); state.failBlockWrite = true;
  assert.equal((await reportPhoto(request("/api/photo-reports", payload))).status, 503);
  assert.equal((await getPhoto()).status, 200);
  state.failBlockWrite = false; state.failInboxWrite = true;
  assert.equal((await reportPhoto(request("/api/photo-reports", payload))).status, 200);
  assert.equal((await getPhoto()).status, 410); assert.equal(files.has(photo.storage_path), false);
});

test("a removal racing with image download is checked again before bytes are returned", async (context) => {
  const { state } = mockStorage(context); state.raceRemoval = true;
  assert.equal((await getPhoto()).status, 410); assert.equal(state.downloads, 1);
});

test("private storage diagnostic cleans only its own temporary file", async (context) => {
  const { files } = mockStorage(context); await checkPrivateStorage();
  assert.deepEqual([...files.keys()], [photo.storage_path]);
});

test("directory inquiries store privately, reject unknown suppliers and report backend failures", async (context) => {
  const { files } = mockStorage(context);
  const lead = { name: "Synthetic test", contact: "test@example.invalid", items: "Test request", buyer_type: "reseller" };
  assert.equal((await submitInquiry(request("/api/leads", lead, "https://unrelated.example"))).status, 403);
  assert.equal((await submitInquiry(request("/api/leads", { ...lead, store_slug: "unknown" }))).status, 400);
  assert.equal((await submitInquiry(request("/api/leads", lead))).status, 200);
  assert.equal([...files.keys()].filter((key) => key.startsWith("inquiries/")).length, 1);
  context.mock.method(privateFiles, "write", async () => { throw new Error("unavailable"); });
  assert.equal((await submitInquiry(request("/api/leads", lead))).status, 502);
});
