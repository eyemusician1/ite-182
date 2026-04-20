import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Tell Next.js that Google avatar URLs are safe to load and optimize
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;