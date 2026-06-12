'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { FileVisibility, StorageDriver } from '@prisma/client';
import { resolveServerActionError } from '@/lib/actions/server-action-errors';
import { getCurrentUser } from '@/lib/auth/current-user';
import { prisma } from '@/lib/db/prisma';
import { assertSameOriginServerAction } from '@/lib/security/server-action-origin';
import { getStorageService } from '@/lib/storage/storage.service';
import { isAllowedPublicImageUpload } from '@/lib/storage/file-signatures';

const SETTINGS_PATH = '/profile/settings';

export async function updateAvatar(formData: FormData) {
  let result: { type: 'success' | 'error'; message: string };
  let pendingStorageKey: { fileKey: string; bucket?: string } | undefined;

  try {
    await assertSameOriginServerAction();
    const user = await getCurrentUser();

    if (!user) {
      redirect('/auth/login');
    }

    const file = formData.get('avatar') as File | null;

    if (!file || file.size === 0) {
      throw new Error('no file');
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    if (!isAllowedPublicImageUpload({ mimeType: file.type, originalName: file.name, buffer })) {
      throw new Error('invalid image type');
    }

    const profile = await prisma.profile.upsert({
      where: { userId: user.id },
      create: { userId: user.id },
      update: {},
      select: { id: true, avatarFileId: true }
    });

    const oldFile = profile.avatarFileId
      ? await prisma.uploadedFile.findUnique({
          where: { id: profile.avatarFileId },
          select: { fileKey: true, bucket: true }
        })
      : null;

    const storageService = getStorageService();
    const upload = await storageService.uploadFile({
      buffer,
      originalName: file.name,
      mimeType: file.type,
      size: file.size,
      visibility: 'public',
      folder: 'profile-avatars'
    });
    pendingStorageKey = { fileKey: upload.fileKey, bucket: upload.bucket };

    await prisma.$transaction(async (tx) => {
      const newUploadedFile = await tx.uploadedFile.create({
        data: {
          storageDriver: upload.storageDriver === 's3' ? StorageDriver.S3 : StorageDriver.LOCAL,
          bucket: upload.bucket ?? null,
          fileKey: upload.fileKey,
          originalName: upload.originalName,
          mimeType: upload.mimeType,
          size: upload.size,
          visibility: FileVisibility.PUBLIC,
          uploadedById: user.id
        }
      });

      await tx.profile.update({
        where: { id: profile.id },
        data: { avatarFileId: newUploadedFile.id }
      });

      if (profile.avatarFileId) {
        await tx.uploadedFile.delete({ where: { id: profile.avatarFileId } });
      }
    });

    pendingStorageKey = undefined;

    if (oldFile) {
      storageService
        .deleteFile({ fileKey: oldFile.fileKey, bucket: oldFile.bucket ?? undefined })
        .catch(() => {});
    }

    revalidatePath('/profile');
    revalidatePath(SETTINGS_PATH);
    result = { type: 'success', message: 'Аватар обновлён.' };
  } catch (error) {
    if (pendingStorageKey) {
      getStorageService()
        .deleteFile({ fileKey: pendingStorageKey.fileKey, bucket: pendingStorageKey.bucket })
        .catch(() => {});
    }

    result = {
      type: 'error',
      message: resolveServerActionError({
        action: 'profile:update-avatar',
        error,
        zodMessage: 'Не удалось загрузить аватар.',
        known: [
          {
            matches: (e: Error) => e.message === 'no file',
            message: 'Файл не выбран.'
          },
          {
            matches: (e: Error) => e.message === 'invalid image type',
            message: 'Допустимые форматы: JPEG, PNG, WebP, AVIF.'
          }
        ],
        fallbackMessage: 'Не удалось загрузить аватар. Попробуйте позже.'
      })
    };
  }

  const url = new URL(SETTINGS_PATH, 'http://localhost');
  url.searchParams.delete('success');
  url.searchParams.delete('error');
  url.searchParams.set(result.type, result.message);
  redirect(`${url.pathname}${url.search}`);
}
