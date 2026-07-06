import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'standalone',
  transpilePackages: [
    '@geocanvas/ui',
    '@geocanvas/types',
    '@geocanvas/crdt',
    '@geocanvas/renderer',
  ],
};

export default nextConfig;
