/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  transpilePackages: ["framer-motion"], // Ensure framer-motion is explicitly transpiled
};

module.exports = nextConfig;