/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  // Removed transpilePackages: ['framer-motion'] as we are now using a custom webpack rule for Babel
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // Add a rule to specifically transpile framer-motion with Babel
    // This is a fallback if SWC is failing to parse it correctly
    config.module.rules.push({
      test: /\.m?js$/, // Apply to JS/MJS files
      // Only target framer-motion within node_modules
      include: (path) => path.includes('node_modules/framer-motion'),
      use: {
        loader: 'babel-loader',
        options: {
          presets: ['next/babel'], // Use Next.js's Babel preset for compatibility
        },
      },
    });
    return config;
  },
};

module.exports = nextConfig;