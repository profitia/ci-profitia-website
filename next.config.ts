import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Enable React 19 features
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "profitia-pl.onrender.com",
      },
    ],
  },
  // i18n is handled via App Router with [lang] segments
};

export default nextConfig;
