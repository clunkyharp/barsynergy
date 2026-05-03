import { execSync } from 'node:child_process';
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

const readDeploymentId = () => {
  if (process.env.APP_DEPLOYMENT_ID) {
    return process.env.APP_DEPLOYMENT_ID;
  }

  try {
    return execSync('git rev-parse --verify HEAD', { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
  } catch {
    return undefined;
  }
};

const deploymentId = readDeploymentId();

const nextConfig: NextConfig = {
  deploymentId,
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
