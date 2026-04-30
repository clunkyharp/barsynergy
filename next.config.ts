import type { NextConfig } from 'next';

const tunnelOrigins = [
  '*.ngrok-free.app',
  '*.ngrok.app',
  '*.ngrok.io',
  '*.trycloudflare.com',
  '*.loca.lt',
  '*.localhost.run'
];

const nextConfig: NextConfig = {
  allowedDevOrigins: tunnelOrigins,
  experimental: {
    serverActions: {
      allowedOrigins: tunnelOrigins
    }
  },
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
