import { GetObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { FileVisibility, StorageDriver } from '@prisma/client';
import { requireAdminSectionAccess } from '@/lib/auth/require-admin-section';
import { prisma } from '@/lib/db/prisma';
import { getEnv } from '@/lib/validation/env';

function resolveLocalUploadPath(fileKey: string) {
  const env = getEnv();
  const uploadRoot = path.resolve(/* turbopackIgnore: true */ env.LOCAL_UPLOAD_DIR);
  const absolutePath = path.resolve(/* turbopackIgnore: true */ uploadRoot, fileKey);
  const relativeToRoot = path.relative(uploadRoot, absolutePath);

  if (relativeToRoot.startsWith('..') || path.isAbsolute(relativeToRoot)) {
    return null;
  }

  return absolutePath;
}

function buildDownloadHeaders(input: { mimeType: string; size: number; originalName: string }) {
  const safeName = input.originalName.replace(/["\r\n]/g, '_');
  const encodedName = encodeURIComponent(input.originalName);

  return {
    'Cache-Control': 'private, no-store',
    'Content-Disposition': `attachment; filename="${safeName}"; filename*=UTF-8''${encodedName}`,
    'Content-Length': String(input.size),
    'Content-Type': input.mimeType,
    'X-Content-Type-Options': 'nosniff'
  };
}

function createS3Client() {
  const env = getEnv();

  return new S3Client({
    endpoint: env.S3_ENDPOINT,
    region: env.S3_REGION,
    credentials: {
      accessKeyId: env.S3_ACCESS_KEY_ID ?? '',
      secretAccessKey: env.S3_SECRET_ACCESS_KEY ?? ''
    },
    forcePathStyle: true
  });
}

export async function GET(_request: Request, context: { params: Promise<{ applicationId: string }> }) {
  await requireAdminSectionAccess('applications');

  const { applicationId } = await context.params;
  const application = await prisma.application.findUnique({
    where: { id: applicationId },
    select: {
      resumeFile: {
        select: {
          storageDriver: true,
          bucket: true,
          fileKey: true,
          originalName: true,
          mimeType: true,
          size: true,
          visibility: true
        }
      }
    }
  });

  const file = application?.resumeFile;

  if (!file || file.visibility !== FileVisibility.PRIVATE) {
    return new Response('Not found', { status: 404 });
  }

  try {
    if (file.storageDriver === StorageDriver.LOCAL) {
      const absolutePath = resolveLocalUploadPath(file.fileKey);

      if (!absolutePath) {
        return new Response('Not found', { status: 404 });
      }

      const body = await readFile(/* turbopackIgnore: true */ absolutePath);
      return new Response(body, {
        headers: buildDownloadHeaders(file)
      });
    }

    if (!file.bucket) {
      return new Response('Not found', { status: 404 });
    }

    const response = await createS3Client().send(
      new GetObjectCommand({
        Bucket: file.bucket,
        Key: file.fileKey
      })
    );

    const body = response.Body ? Buffer.from(await response.Body.transformToByteArray()) : null;

    if (!body) {
      return new Response('Not found', { status: 404 });
    }

    return new Response(body, {
      headers: buildDownloadHeaders(file)
    });
  } catch {
    return new Response('Not found', { status: 404 });
  }
}
