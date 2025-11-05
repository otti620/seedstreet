/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  transpilePackages: ['framer-motion'], // Re-add framer-motion to transpilePackages
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // Removed the custom babel-loader rule for framer-motion
    return config;
  },
};

module.exports = nextConfig;