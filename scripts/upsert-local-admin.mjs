import { Buffer } from 'node:buffer';
import { randomBytes } from 'node:crypto';
import { URL } from 'node:url';

import bcrypt from 'bcryptjs';
import { PrismaClient, UserRole, UserStatus } from '@prisma/client';

const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error']
});

const DEFAULT_EMAIL = 'admin@barsynergy.local';
const SALT_ROUNDS = 12;
const MIN_PASSWORD_LENGTH = 12;
const LOCAL_DATABASE_HOSTS = new Set(['localhost', '127.0.0.1', '::1', 'postgres']);

function getArgValue(name) {
  const index = process.argv.indexOf(name);

  if (index === -1) {
    return null;
  }

  return process.argv[index + 1] ?? null;
}

function hasArg(name) {
  return process.argv.includes(name);
}

function normalizeEmail(value) {
  return value.trim().toLowerCase();
}

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function ensureLocalDatabaseUrl(databaseUrl) {
  if (!databaseUrl) {
    throw new Error('DATABASE_URL is missing. Load the local .env before running the script.');
  }

  const parsed = new URL(databaseUrl);

  if (!LOCAL_DATABASE_HOSTS.has(parsed.hostname)) {
    throw new Error(
      `Refusing to run against non-local database host "${parsed.hostname}". Use a local DATABASE_URL only.`
    );
  }
}

function generatePassword() {
  return randomBytes(18).toString('base64url');
}

async function readPasswordFromStdin() {
  const chunks = [];

  for await (const chunk of process.stdin) {
    chunks.push(chunk);
  }

  return Buffer.concat(chunks).toString('utf8').trim();
}

async function resolvePassword() {
  if (hasArg('--password-stdin')) {
    return readPasswordFromStdin();
  }

  return getArgValue('--password') ?? process.env.ADMIN_PASSWORD ?? generatePassword();
}

function printUsage() {
  console.log('Usage: npm run admin:upsert:local -- [--email admin@barsynergy.local] [--password <value> | --password-stdin]');
  console.log('If no password is provided, the script generates a strong local password and prints it once.');
}

async function main() {
  if (hasArg('--help')) {
    printUsage();
    return;
  }

  if (process.env.NODE_ENV === 'production') {
    throw new Error('Refusing to run with NODE_ENV=production.');
  }

  ensureLocalDatabaseUrl(process.env.DATABASE_URL);

  const email = normalizeEmail(getArgValue('--email') ?? process.env.ADMIN_EMAIL ?? DEFAULT_EMAIL);
  const password = await resolvePassword();

  if (!isValidEmail(email)) {
    throw new Error(`Invalid admin email: "${email}"`);
  }

  if (!password) {
    throw new Error('Password is empty.');
  }

  if (password.length < MIN_PASSWORD_LENGTH) {
    throw new Error(`Password must be at least ${MIN_PASSWORD_LENGTH} characters long.`);
  }

  const existingUser = await prisma.user.findUnique({
    where: { email },
    select: { id: true, email: true, role: true }
  });

  if (existingUser && existingUser.role !== UserRole.ADMIN) {
    throw new Error(
      `User "${email}" already exists with role "${existingUser.role}". Refusing to overwrite a non-admin account.`
    );
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  const user = await prisma.user.upsert({
    where: { email },
    update: {
      passwordHash,
      status: UserStatus.ACTIVE
    },
    create: {
      email,
      passwordHash,
      role: UserRole.ADMIN,
      status: UserStatus.ACTIVE
    },
    select: {
      id: true,
      email: true,
      role: true,
      status: true
    }
  });

  await prisma.session.deleteMany({
    where: {
      userId: user.id
    }
  });

  console.log(`[admin-upsert] Admin account is ready.`);
  console.log(`[admin-upsert] Email: ${user.email}`);
  console.log(`[admin-upsert] Password: ${password}`);
  console.log(`[admin-upsert] Role: ${user.role}`);
  console.log(`[admin-upsert] Status: ${user.status}`);
  console.log('[admin-upsert] Existing sessions for this user were deleted.');
}

main()
  .catch((error) => {
    console.error('[admin-upsert] Failed to create or reset local admin.');
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
