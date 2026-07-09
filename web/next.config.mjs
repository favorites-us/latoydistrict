/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // no remote images in v0; keeps the site deployable anywhere
  images: { unoptimized: true },
};

export default nextConfig;
