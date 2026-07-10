import path from "node:path";
import { fileURLToPath } from "node:url";

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // no remote images in v0; keeps the site deployable anywhere
  images: { unoptimized: true },
  // This app is the web/ subdir of the repo; pin the tracing root here so the
  // root-level lockfile doesn't trigger the "inferred workspace root" warning.
  outputFileTracingRoot: path.dirname(fileURLToPath(import.meta.url)),
};

export default nextConfig;
