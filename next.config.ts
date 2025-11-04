import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  transpilePackages: ["framer-motion"], // Ensure framer-motion is explicitly transpiled
};

export default nextConfig;