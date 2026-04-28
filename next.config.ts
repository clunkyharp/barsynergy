import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  allowedDevOrigins: ['*.ngrok-free.app', '*.ngrok.app', '*.ngrok.io'],
  output: 'standalone',
  poweredByHeader: false,
  reactStrictMode: true,
  turbopack: {
    root: process.cwd()
  },
  images: {
    qualities: [68, 72, 75],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 's3.twcstorage.ru'
      }
    ]
  }
};

export default nextConfig;
