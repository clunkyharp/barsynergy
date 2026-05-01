import type { NextConfig } from 'next';

const tunnelOrigins = [
  '*.ngrok-free.app',
  '*.ngrok-free.dev',
  '*.ngrok.app',
  '*.ngrok.io',
  '*.trycloudflare.com',
  '*.loca.lt',
  '*.localhost.run'
];

const shouldAllowTunnelServerActions = process.env.NODE_ENV === 'development';

const nextConfig: NextConfig = {
  allowedDevOrigins: tunnelOrigins,
  experimental: {
    ...(shouldAllowTunnelServerActions
      ? {
          serverActions: {
            allowedOrigins: tunnelOrigins
          }
        }
      : {})
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
      },
      {
        protocol: 'https',
        hostname: '72.56.1.69.sslip.io'
      },
      {
        protocol: 'https',
        hostname: 'barsynergy.ru'
      }
    ]
  }
};

export default nextConfig;
