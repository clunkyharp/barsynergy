import { GetObjectCommand } from '@aws-sdk/client-s3';
import { createReadStream } from 'node:fs';
import { access } from 'node:fs/promises';
import path from 'node:path';
import { Readable } from 'node:stream';
import { FileVisibility, StorageDriver } from '@prisma/client';
import { requireAdminSectionAccess } from '@/lib/auth/require-admin-section';
import { prisma } from '@/lib/db/prisma';
import { getS3Client } from '@/lib/storage/s3-client';
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

function toWebStream(body: unknown) {
  if (!body) {
    return null;
  }

  if (
    typeof body === 'object' &&
    'transformToWebStream' in body &&
    typeof body.transformToWebStream === 'function'
  ) {
    return body.transformToWebStream();
  }

  if (body instanceof Readable) {
    return Readable.toWeb(body);
  }

  return null;
}

function asResponseBody(stream: ReturnType<typeof Readable.toWeb>) {
  return stream as unknown as ReadableStream<Uint8Array>;
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

      await access(/* turbopackIgnore: true */ absolutePath);

      return new Response(asResponseBody(Readable.toWeb(createReadStream(/* turbopackIgnore: true */ absolutePath))), {
        headers: buildDownloadHeaders(file)
      });
    }

    if (!file.bucket) {
      return new Response('Not found', { status: 404 });
    }

    const response = await getS3Client(getEnv()).send(
      new GetObjectCommand({
        Bucket: file.bucket,
        Key: file.fileKey
      })
    );

    const body = toWebStream(response.Body);

    if (!body) {
      return new Response('Not found', { status: 404 });
    }

    return new Response(body as unknown as ReadableStream<Uint8Array>, {
      headers: buildDownloadHeaders(file)
    });
  } catch {
    return new Response('Not found', { status: 404 });
  }
}
