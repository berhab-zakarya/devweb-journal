import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Strict mode on for development warnings
  reactStrictMode: true,

  // Bundle analysis (run: ANALYZE=true next build)
  ...(process.env.ANALYZE === 'true' && {
    experimental: {},
  }),
};

export default nextConfig;
