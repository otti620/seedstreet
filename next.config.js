/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  transpilePackages: ['framer-motion'], // Explicitly transpile framer-motion
  // Add any other existing configurations here if you have them
};

module.exports = nextConfig;