import { createHmac, randomBytes } from 'node:crypto';
import { rm } from 'node:fs/promises';
import path from 'node:path';
import nextEnv from '@next/env';
import { PrismaClient, StorageDriver, UserRole, UserStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';
import type { BrowserContext } from '@playwright/test';

const { loadEnvConfig } = nextEnv;

loadEnvConfig(process.cwd());

const prisma = new PrismaClient();
const localDatabaseHosts = new Set(['localhost', '127.0.0.1', '::1', 'postgres']);
const sessionCookieName = 'barsynergy_session';
const developmentSessionSecret = 'barsynergy-development-session-secret';
const adminEmail = 'admin-e2e@barsynergy.local';

function ensureLocalDatabase() {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error('DATABASE_URL is required for authenticated Playwright QA.');
  }

  const parsed = new URL(databaseUrl);

  if (!localDatabaseHosts.has(parsed.hostname)) {
    throw new Error(`Refusing to run authenticated Playwright QA against non-local database host "${parsed.hostname}".`);
  }
}

function hashSessionToken(token: string) {
  const secret = process.env.SESSION_SECRET ?? (process.env.NODE_ENV === 'production' ? undefined : developmentSessionSecret);

  if (!secret) {
    throw new Error('SESSION_SECRET is required for authenticated Playwright QA.');
  }

  return createHmac('sha256', secret).update(token).digest('hex');
}

export async function createAdminSession(context: BrowserContext, baseURL: string) {
  ensureLocalDatabase();

  const passwordHash = await bcrypt.hash(randomBytes(24).toString('base64url'), 12);
  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      passwordHash,
      role: UserRole.ADMIN,
      status: UserStatus.ACTIVE
    },
    create: {
      email: adminEmail,
      passwordHash,
      role: UserRole.ADMIN,
      status: UserStatus.ACTIVE
    },
    select: { id: true }
  });

  await prisma.session.deleteMany({ where: { userId: admin.id } });

  const token = randomBytes(32).toString('base64url');
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

  await prisma.session.create({
    data: {
      userId: admin.id,
      tokenHash: hashSessionToken(token),
      expiresAt
    }
  });

  const url = new URL(baseURL);

  await context.addCookies([
    {
      domain: url.hostname,
      expires: Math.floor(expiresAt.getTime() / 1000),
      httpOnly: true,
      name: sessionCookieName,
      path: '/',
      sameSite: 'Lax',
      secure: url.protocol === 'https:',
      value: token
    }
  ]);

  return admin.id;
}

export async function cleanupAdminSessionData() {
  await prisma.session.deleteMany({
    where: {
      user: { email: adminEmail }
    }
  });
  await prisma.user.deleteMany({ where: { email: adminEmail } });
}

export async function cleanupUploadedFile(fileId: string) {
  const file = await prisma.uploadedFile.findUnique({
    where: { id: fileId },
    select: {
      fileKey: true,
      storageDriver: true
    }
  });

  await prisma.uploadedFile.deleteMany({ where: { id: fileId } });

  if (file?.storageDriver === StorageDriver.LOCAL) {
    const uploadRoot = path.resolve(process.env.LOCAL_UPLOAD_DIR ?? './uploads');
    const absolutePath = path.resolve(uploadRoot, file.fileKey);
    const relativePath = path.relative(uploadRoot, absolutePath);

    if (relativePath && !relativePath.startsWith('..') && !path.isAbsolute(relativePath)) {
      await rm(absolutePath, { force: true });
    }
  }
}

export async function cleanupUploadedFilesByOriginalName(originalName: string) {
  const files = await prisma.uploadedFile.findMany({
    where: { originalName },
    select: { id: true }
  });

  for (const file of files) {
    await cleanupUploadedFile(file.id);
  }
}

export async function disconnectAdminTestPrisma() {
  await prisma.$disconnect();
}
