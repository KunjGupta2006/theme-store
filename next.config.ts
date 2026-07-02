import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["@prisma/client", "@prisma/engines"],
  outputFileTracingIncludes: {
    "**/*": ["./src/generated/prisma/**/*"],
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "img.clerk.com",  // for user avatars later
      },
    ],
  },
};

export default nextConfig;