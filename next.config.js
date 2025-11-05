/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  transpilePackages: ["framer-motion"],
  compiler: {
    // This is a more explicit way to tell SWC to use the automatic JSX runtime
    // which should be compatible with framer-motion's AnimatePresence.
    // It might be redundant with tsconfig.json's "jsx": "react-jsx",
    // but can sometimes resolve stubborn parsing issues.
    jsc: {
      transform: {
        react: {
          runtime: 'automatic',
        },
      },
    },
  },
};

module.exports = nextConfig;