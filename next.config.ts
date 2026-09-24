import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  // Relaxing images configuration if needed for external sources
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
};

export default nextConfig;
