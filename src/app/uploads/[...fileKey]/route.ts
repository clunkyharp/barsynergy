import { createReadStream } from 'node:fs';
import { access } from 'node:fs/promises';
import path from 'node:path';
import { Readable } from 'node:stream';
import { FileVisibility, StorageDriver } from '@prisma/client';
import { prisma } from '@/lib/db/prisma';
import { getEnv } from '@/lib/validation/env';

function resolveLocalUploadPath(fileKey: string) {
  const env = getEnv();
  const uploadRoot = path.resolve(/* turbopackIgnore: true */ env.LOCAL_UPLOAD_DIR);
  const absolutePath = path.resolve(uploadRoot, fileKey);
  const relativeToRoot = path.relative(uploadRoot, absolutePath);

  if (relativeToRoot.startsWith('..') || path.isAbsolute(relativeToRoot)) {
    return null;
  }

  return absolutePath;
}

function asResponseBody(stream: ReturnType<typeof Readable.toWeb>) {
  return stream as unknown as ReadableStream<Uint8Array>;
}

export async function GET(_request: Request, context: { params: Promise<{ fileKey?: string[] }> }) {
  const env = getEnv();

  if (env.STORAGE_DRIVER !== 'local') {
    return new Response('Not found', { status: 404 });
  }

  const { fileKey: fileKeySegments = [] } = await context.params;
  const fileKey = fileKeySegments.join('/');
  const absolutePath = resolveLocalUploadPath(fileKey);

  if (!fileKey || !absolutePath) {
    return new Response('Not found', { status: 404 });
  }

  const file = await prisma.uploadedFile.findFirst({
    where: {
      fileKey,
      storageDriver: StorageDriver.LOCAL,
      visibility: FileVisibility.PUBLIC
    },
    select: { mimeType: true, size: true }
  });

  if (!file) {
    return new Response('Not found', { status: 404 });
  }

  try {
    await access(/* turbopackIgnore: true */ absolutePath);

    return new Response(asResponseBody(Readable.toWeb(createReadStream(/* turbopackIgnore: true */ absolutePath))), {
      headers: {
        'Cache-Control': 'public, max-age=3600',
        'Content-Length': String(file.size),
        'Content-Type': file.mimeType,
        'X-Content-Type-Options': 'nosniff'
      }
    });
  } catch {
    return new Response('Not found', { status: 404 });
  }
}
