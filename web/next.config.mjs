import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async redirects() {
    const { stores } = JSON.parse(readFileSync(new URL("./data/stores.json", import.meta.url), "utf8"));
    const duplicates = stores.filter(store => store.duplicate_of).flatMap(store => ["", "/es"].map(prefix => ({
      source: `${prefix}/stores/${store.slug}`, destination: `${prefix}/stores/${store.duplicate_of}`, permanent: true,
    })));
    return [...duplicates, { source: "/:path*", has: [{ type: "host", value: "www.toydistrictlosangeles.com" }], destination: "https://toydistrictlosangeles.com/:path*", permanent: true }];
  },
  // no remote images in v0; keeps the site deployable anywhere
  images: { unoptimized: true },
  // This app is the web/ subdir of the repo; pin the tracing root here so the
  // root-level lockfile doesn't trigger the "inferred workspace root" warning.
  outputFileTracingRoot: path.dirname(fileURLToPath(import.meta.url)),
};

export default nextConfig;
