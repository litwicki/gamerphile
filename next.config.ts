import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "render.worldofwarcraft.com",
      },
      {
        protocol: "https",
        hostname: "cdn.raiderio.net",
      },
      {
        protocol: "https",
        hostname: "assets.rpglogs.com",
      },
    ],
  },
};

export default nextConfig;
