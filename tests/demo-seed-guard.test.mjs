import assert from 'node:assert/strict';
import test from 'node:test';

const { getDemoSeedConfig, isLocalDemoDatabaseUrl } = await import('../scripts/demo-seed-guard.mjs');

test('demo seed guard accepts only explicit local database configuration', () => {
  assert.equal(isLocalDemoDatabaseUrl('postgresql://bars:bars@localhost:55432/bars'), true);
  assert.equal(isLocalDemoDatabaseUrl('postgres://bars:bars@127.0.0.1:55432/bars'), true);
  assert.equal(isLocalDemoDatabaseUrl('postgresql://bars:bars@[::1]:55432/bars'), true);
  assert.equal(isLocalDemoDatabaseUrl('postgresql://bars:bars@postgres:5432/bars'), false);
  assert.equal(isLocalDemoDatabaseUrl('mysql://bars:bars@localhost:3306/bars'), false);
  assert.equal(isLocalDemoDatabaseUrl('not a database url'), false);
});

test('demo seed config requires an opt-in local development password', () => {
  const validEnv = {
    NODE_ENV: 'development',
    DATABASE_URL: 'postgresql://bars:bars@localhost:55432/bars',
    BARSYNERGY_ALLOW_DEMO_SEED: 'true',
    DEMO_BUSINESS_PASSWORD: '  StrongLocal1234  '
  };

  assert.deepEqual(getDemoSeedConfig(validEnv), { demoBusinessPassword: 'StrongLocal1234' });
  assert.throws(
    () => getDemoSeedConfig({ ...validEnv, BARSYNERGY_ALLOW_DEMO_SEED: '' }),
    /BARSYNERGY_ALLOW_DEMO_SEED=true/
  );
  assert.throws(() => getDemoSeedConfig({ ...validEnv, NODE_ENV: 'production' }), /disabled in production/);
  assert.throws(
    () => getDemoSeedConfig({ ...validEnv, DATABASE_URL: 'postgresql://bars:bars@db.example:5432/bars' }),
    /local DATABASE_URL/
  );
  assert.throws(() => getDemoSeedConfig({ ...validEnv, DEMO_BUSINESS_PASSWORD: 'short' }), /DEMO_BUSINESS_PASSWORD/);
});
