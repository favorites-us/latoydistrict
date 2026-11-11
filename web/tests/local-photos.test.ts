import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, mkdir, writeFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { photos, photosForStore } from "../lib/photos";
import { stores } from "../lib/stores";
import { GET } from "../app/api/store-photos/[id]/route";

test("official photo manifest has the reviewed counts and valid store slugs", () => {
  assert.equal(photos.length, 13);
  assert.equal(photosForStore("california-balloon-house-447").length, 0);
  assert.ok(photos.every(photo => !new URL(photo.source_page_url).hostname.endsWith("caballoonhouse.com")));
  for (const [slug, count] of Object.entries({ "americas-favors-405": 6, "fantasia-sales-inc-401": 2, "the-supply-joint-325": 3 })) {
    assert.ok(stores.some(store => store.slug === slug));
    const gallery = photosForStore(slug);
    assert.equal(gallery.length, count);
    gallery.forEach((photo, index) => {
      assert.equal(photo.id, `${slug}-official-${index + 1}`);
      assert.equal(photo.storage_path, `${photo.id}.webp`);
      assert.equal(photo.publication_basis, "official_site_opt_out_2026_11_11");
      assert.equal(photo.mime_type, "image/webp");
    });
  }
});

test("local preview is development-only, requires no Blob token, and honors suppression", async context => {
  const directory = await mkdtemp(join(tmpdir(), "local-photos-"));
  const previousEnv = process.env;
  process.env = { ...previousEnv, NODE_ENV: "development" };
  delete process.env.BLOB_READ_WRITE_TOKEN;
  context.mock.method(process, "cwd", () => directory);
  context.mock.method(globalThis, "fetch", async () => { throw new Error("No external services in tests"); });
  const photo = photosForStore("americas-favors-405")[0];
  const get = () => GET(new Request(`http://localhost/api/store-photos/${photo.id}`), { params: Promise.resolve({ id: photo.id }) });
  try {
    await mkdir(join(directory, ".local-photos", "photo-blocks"), { recursive: true });
    assert.equal((await get()).status, 404);
    const bytes = Buffer.from("local preview fixture");
    await writeFile(join(directory, ".local-photos", photo.storage_path), bytes);
    const response = await get();
    assert.equal(response.status, 200);
    assert.equal(response.headers.get("content-type"), "image/webp");
    assert.deepEqual(Buffer.from(await response.arrayBuffer()), bytes);
    process.env.NODE_ENV = "production";
    assert.equal((await get()).status, 503);
    process.env.NODE_ENV = "development";
    process.env.BLOB_READ_WRITE_TOKEN = "invalid-test-token";
    assert.equal((await get()).status, 503);
    delete process.env.BLOB_READ_WRITE_TOKEN;
    await writeFile(join(directory, ".local-photos", "photo-blocks", `${photo.id}.json`), "{}");
    assert.equal((await get()).status, 410);
  } finally {
    process.env = previousEnv;
    await rm(directory, { recursive: true, force: true });
  }
});
