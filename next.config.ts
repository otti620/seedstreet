import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["framer-motion"], // Keep framer-motion here
  // Temporarily removing the webpack configuration to diagnose the framer-motion issue.
  // webpack: (config) => {
  //   if (process.env.NODE_ENV === "development") {
  //     config.module.rules.push({
  //       test: /\.(jsx|tsx)$/,
  //       exclude: /node_modules/,
  //       enforce: "pre",
  //       use: "@dyad-sh/nextjs-webpack-component-tagger",
  //     });
  //   }
  //   return config;
  // },
};

export default nextConfig;