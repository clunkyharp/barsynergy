import { URL } from 'node:url';

const LOCAL_DEMO_DATABASE_HOSTS = new Set(['localhost', '127.0.0.1', '::1', '[::1]']);

export function isLocalDemoDatabaseUrl(databaseUrl) {
  if (!databaseUrl) {
    return false;
  }

  try {
    const parsed = new URL(databaseUrl);

    return (
      ['postgresql:', 'postgres:'].includes(parsed.protocol) &&
      LOCAL_DEMO_DATABASE_HOSTS.has(parsed.hostname)
    );
  } catch {
    return false;
  }
}

export function getDemoSeedConfig(env = process.env) {
  if (env.BARSYNERGY_ALLOW_DEMO_SEED !== 'true') {
    throw new Error('demo seed requires BARSYNERGY_ALLOW_DEMO_SEED=true');
  }

  if (env.NODE_ENV === 'production') {
    throw new Error('demo seed is disabled in production');
  }

  if (!isLocalDemoDatabaseUrl(env.DATABASE_URL)) {
    throw new Error('demo seed requires a local DATABASE_URL');
  }

  const demoBusinessPassword = env.DEMO_BUSINESS_PASSWORD?.trim();

  if (!demoBusinessPassword || demoBusinessPassword.length < 12) {
    throw new Error('demo seed requires DEMO_BUSINESS_PASSWORD with at least 12 characters');
  }

  return { demoBusinessPassword };
}
