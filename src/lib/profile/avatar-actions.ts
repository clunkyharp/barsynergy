'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { FileVisibility, StorageDriver } from '@prisma/client';
import { resolveServerActionError } from '@/lib/actions/server-action-errors';
import { getCurrentUser } from '@/lib/auth/current-user';
import { prisma } from '@/lib/db/prisma';
import type { ProfileActionResult } from '@/lib/profile/profile-action-result';
import { assertSameOriginServerAction } from '@/lib/security/server-action-origin';
import { getStorageService } from '@/lib/storage/storage.service';
import { isAllowedPublicImageUpload } from '@/lib/storage/file-signatures';
import { MAX_UPLOAD_FILE_SIZE_BYTES } from '@/lib/storage/storage.types';

const SETTINGS_PATH = '/profile/settings';

export async function updateAvatar(_prevState: ProfileActionResult, formData: FormData): Promise<ProfileActionResult> {
  let result: Exclude<ProfileActionResult, null>;
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

    if (file.size > MAX_UPLOAD_FILE_SIZE_BYTES) {
      throw new Error('file too large');
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
    revalidatePath(SETTINGS_PATH, 'layout');
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
            matches: (e: Error) => e.message === 'file too large',
            message: 'Файл слишком большой. Максимум 8 МБ.'
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

  return result;
}
