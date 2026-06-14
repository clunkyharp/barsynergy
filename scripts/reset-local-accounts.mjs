import { randomBytes } from 'node:crypto';
import { URL } from 'node:url';

import bcrypt from 'bcryptjs';
import { PrismaClient, UserRole, UserStatus } from '@prisma/client';

const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error']
});

const SALT_ROUNDS = 12;
const LOCAL_DATABASE_HOSTS = new Set(['localhost', '127.0.0.1', '::1', 'postgres']);

const ACCOUNTS = [
  { email: 'admin@barsynergy.local', role: UserRole.ADMIN, label: 'Admin' },
  { email: 'moderator@barsynergy.local', role: UserRole.MODERATOR, label: 'Moderator' },
  { email: 'business@barsynergy.local', role: UserRole.BUSINESS, label: 'Business' },
  { email: 'user@barsynergy.local', role: UserRole.USER, label: 'User' },
];

function generatePassword() {
  return randomBytes(18).toString('base64url');
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

async function main() {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('Refusing to run with NODE_ENV=production.');
  }

  ensureLocalDatabaseUrl(process.env.DATABASE_URL);

  const accountPasswords = ACCOUNTS.map((account) => ({
    ...account,
    password: generatePassword(),
  }));

  // Delete all users — DB cascade handles sessions, profiles, tokens, etc.
  const { count: deletedCount } = await prisma.user.deleteMany();
  console.log(`[reset-accounts] Deleted ${deletedCount} existing user(s) and all related data.`);

  // Create accounts for each role
  const createdUsers = [];
  for (const account of accountPasswords) {
    const passwordHash = await bcrypt.hash(account.password, SALT_ROUNDS);

    const user = await prisma.user.create({
      data: {
        email: account.email,
        passwordHash,
        role: account.role,
        status: UserStatus.ACTIVE,
        emailVerifiedAt: new Date(),
      },
      select: { id: true, email: true, role: true, status: true },
    });

    createdUsers.push({ ...user, password: account.password, label: account.label });
  }

  console.log(`[reset-accounts] Created ${createdUsers.length} account(s).`);
  console.log('');

  for (const u of createdUsers) {
    console.log(`  ${u.label}:`);
    console.log(`    Email:    ${u.email}`);
    console.log(`    Password: ${u.password}`);
    console.log(`    Role:     ${u.role}`);
    console.log(`    Status:   ${u.status}`);
    console.log('');
  }

  console.log('[reset-accounts] Done.');
}

main()
  .catch((error) => {
    console.error('[reset-accounts] Failed to reset local accounts.');
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
