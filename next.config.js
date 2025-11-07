/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  // Removed framer-motion from transpilePackages to avoid potential conflicts
  // transpilePackages: ['framer-motion'], 
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // Removed the custom babel-loader rule for framer-motion
    return config;
  },
};

module.exports = nextConfig;