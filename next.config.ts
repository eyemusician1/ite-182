import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Optimize Google avatar image loading
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        pathname: '/**',
      },
    ],
    formats: ['image/avif', 'image/webp'],
  },

  // Compress responses
  compress: true,

  // Reduce bundle size by removing source maps in production
  productionBrowserSourceMaps: false,

  experimental: {
    // Optimize package imports to reduce bundle size
    optimizePackageImports: [
      '@supabase/ssr',
      '@supabase/supabase-js',
      'lucide-react',
    ],
  },
};

export default nextConfig;