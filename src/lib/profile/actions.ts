'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { FileVisibility, StorageDriver } from '@prisma/client';
import { getString, getArray, nullableString, optionalString } from '@/lib/admin/content-utils';
import { resolveServerActionError } from '@/lib/actions/server-action-errors';
import { getCurrentUser } from '@/lib/auth/current-user';
import { hashPassword, verifyPassword } from '@/lib/auth/password';
import { prisma } from '@/lib/db/prisma';
import { assertSameOriginServerAction } from '@/lib/security/server-action-origin';
import { getStorageService } from '@/lib/storage/storage.service';
import { isAllowedPublicImageUpload } from '@/lib/storage/file-signatures';

const PROFILE_PATH = '/profile';
const SETTINGS_PATH = '/profile/settings';

const basicProfileSchema = z.object({
  fullName: z.string().trim().min(1).max(120),
  cityId: z.string().trim().optional(),
  profession: z.string().trim().max(120).optional(),
  company: z.string().trim().max(160).optional(),
  bio: z.string().trim().max(1000).optional(),
  phone: z.string().trim().max(80).optional(),
  telegram: z.string().trim().max(80).optional(),
  website: z.string().trim().url().max(240).optional().or(z.literal(''))
});

const jobSearchSchema = z.object({
  jobSearchStatus: z.enum(['ACTIVE', 'OPEN', 'NOT_LOOKING']).optional(),
  desiredSalary: z.coerce.number().int().min(0).optional().nullable(),
  desiredSalaryMax: z.coerce.number().int().min(0).optional().nullable(),
  employmentTypes: z.array(z.enum(['FULL_TIME', 'PART_TIME', 'FREELANCE', 'REMOTE'])),
  isPublic: z.coerce.boolean()
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1).max(200),
  newPassword: z.string().min(6).max(200),
  confirmPassword: z.string().min(1).max(200)
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Пароли не совпадают',
  path: ['confirmPassword']
});

const workExperienceSchema = z.object({
  id: z.string().optional(),
  companyName: z.string().trim().min(1).max(240),
  position: z.string().trim().min(1).max(240),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().nullable(),
  description: z.string().trim().max(2000).optional().nullable(),
  sortOrder: z.coerce.number().int().default(0)
});

export async function updateBasicProfile(formData: FormData) {
  let result: { type: 'success' | 'error'; message: string };

  try {
    await assertSameOriginServerAction();
    const user = await getCurrentUser();

    if (!user) {
      redirect('/auth/login');
    }

    const parsed = basicProfileSchema.parse({
      fullName: getString(formData, 'fullName'),
      cityId: optionalString(getString(formData, 'cityId')),
      profession: optionalString(getString(formData, 'profession')),
      company: optionalString(getString(formData, 'company')),
      bio: optionalString(getString(formData, 'bio')),
      phone: optionalString(getString(formData, 'phone')),
      telegram: optionalString(getString(formData, 'telegram')),
      website: getString(formData, 'website')
    });

    if (parsed.cityId) {
      const city = await prisma.city.findFirst({
        where: { id: parsed.cityId, isActive: true },
        select: { id: true }
      });

      if (!city) {
        throw new Error('city is invalid');
      }
    }

    await prisma.profile.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        fullName: parsed.fullName,
        cityId: nullableString(parsed.cityId),
        profession: nullableString(parsed.profession),
        company: nullableString(parsed.company),
        bio: nullableString(parsed.bio),
        phone: nullableString(parsed.phone),
        telegram: nullableString(parsed.telegram),
        website: nullableString(parsed.website)
      },
      update: {
        fullName: parsed.fullName,
        cityId: nullableString(parsed.cityId),
        profession: nullableString(parsed.profession),
        company: nullableString(parsed.company),
        bio: nullableString(parsed.bio),
        phone: nullableString(parsed.phone),
        telegram: nullableString(parsed.telegram),
        website: nullableString(parsed.website)
      }
    });

    revalidatePath(PROFILE_PATH);
    revalidatePath(SETTINGS_PATH);
    result = { type: 'success', message: 'Профиль сохранён.' };
  } catch (error) {
    result = {
      type: 'error',
      message: resolveServerActionError({
        action: 'profile:update-basic',
        error,
        zodMessage: 'Не удалось сохранить профиль. Проверьте поля.',
        known: [
          {
            matches: (e: Error) => e.message === 'city is invalid',
            message: 'Этот город сейчас недоступен для выбора.'
          }
        ],
        fallbackMessage: 'Не удалось сохранить профиль. Попробуйте позже.'
      })
    };
  }

  const url = new URL(SETTINGS_PATH, 'http://localhost');
  url.searchParams.delete('success');
  url.searchParams.delete('error');
  url.searchParams.set(result.type, result.message);
  redirect(`${url.pathname}${url.search}`);
}

export async function updateJobSearch(formData: FormData) {
  let result: { type: 'success' | 'error'; message: string };

  try {
    await assertSameOriginServerAction();
    const user = await getCurrentUser();

    if (!user) {
      redirect('/auth/login');
    }

    const parsed = jobSearchSchema.parse({
      jobSearchStatus: optionalString(getString(formData, 'jobSearchStatus')),
      desiredSalary: optionalString(getString(formData, 'desiredSalary').replace(/\D/g, '')),
      desiredSalaryMax: optionalString(getString(formData, 'desiredSalaryMax').replace(/\D/g, '')),
      employmentTypes: getArray(formData, 'employmentTypes'),
      isPublic: formData.get('isPublic') === 'on'
    });

    await prisma.profile.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        fullName: '',
        jobSearchStatus: parsed.jobSearchStatus as never,
        desiredSalary: parsed.desiredSalary ?? null,
        desiredSalaryMax: parsed.desiredSalaryMax ?? null,
        employmentTypes: parsed.employmentTypes as never,
        isPublic: parsed.isPublic
      },
      update: {
        jobSearchStatus: parsed.jobSearchStatus as never,
        desiredSalary: parsed.desiredSalary ?? null,
        desiredSalaryMax: parsed.desiredSalaryMax ?? null,
        employmentTypes: parsed.employmentTypes as never,
        isPublic: parsed.isPublic
      }
    });

    revalidatePath(PROFILE_PATH);
    revalidatePath(SETTINGS_PATH);
    result = { type: 'success', message: 'Статус поиска сохранён.' };
  } catch (error) {
    result = {
      type: 'error',
      message: resolveServerActionError({
        action: 'profile:update-job-search',
        error,
        zodMessage: 'Не удалось сохранить статус поиска.',
        known: [],
        fallbackMessage: 'Не удалось сохранить статус поиска. Попробуйте позже.'
      })
    };
  }

  const url = new URL(SETTINGS_PATH, 'http://localhost');
  url.searchParams.delete('success');
  url.searchParams.delete('error');
  url.searchParams.set(result.type, result.message);
  redirect(`${url.pathname}${url.search}`);
}

export async function updateWorkExperiences(formData: FormData) {
  let result: { type: 'success' | 'error'; message: string };

  try {
    await assertSameOriginServerAction();
    const user = await getCurrentUser();

    if (!user) {
      redirect('/auth/login');
    }

    const profile = await prisma.profile.findUnique({ where: { userId: user.id }, select: { id: true } });

    if (!profile) {
      throw new Error('profile not found');
    }

    const rawExperiences: unknown[] = [];
    const indexes = [...new Set(
      Array.from(formData.keys())
        .filter((k) => k.startsWith('experiences.'))
        .map((k) => k.split('.')[1])
    )];

    for (const idx of indexes) {
      rawExperiences.push({
        id: optionalString(getString(formData, `experiences.${idx}.id`)),
        companyName: getString(formData, `experiences.${idx}.companyName`),
        position: getString(formData, `experiences.${idx}.position`),
        startDate: getString(formData, `experiences.${idx}.startDate`),
        endDate: optionalString(getString(formData, `experiences.${idx}.endDate`)),
        description: optionalString(getString(formData, `experiences.${idx}.description`)),
        sortOrder: Number(idx)
      });
    }

    const filteredExperiences = rawExperiences.filter(
      (e) => (e as Record<string, unknown>).companyName || (e as Record<string, unknown>).position || (e as Record<string, unknown>).startDate
    );

    const parsed = z.array(workExperienceSchema).parse(filteredExperiences);

    const existingIds = new Set(
      (await prisma.workExperience.findMany({
        where: { profileId: profile.id },
        select: { id: true }
      })).map((e) => e.id)
    );

    const incomingIds = new Set(parsed.filter((e) => e.id).map((e) => e.id as string));
    const toDelete = [...existingIds].filter((id) => !incomingIds.has(id));

    await prisma.$transaction(async (tx) => {
      if (toDelete.length > 0) {
        await tx.workExperience.deleteMany({ where: { id: { in: toDelete } } });
      }

      for (const exp of parsed) {
        if (exp.id) {
          await tx.workExperience.update({
            where: { id: exp.id },
            data: {
              companyName: exp.companyName,
              position: exp.position,
              startDate: new Date(exp.startDate),
              endDate: exp.endDate ? new Date(exp.endDate) : null,
              description: exp.description ?? null,
              sortOrder: exp.sortOrder
            }
          });
        } else {
          await tx.workExperience.create({
            data: {
              profileId: profile.id,
              companyName: exp.companyName,
              position: exp.position,
              startDate: new Date(exp.startDate),
              endDate: exp.endDate ? new Date(exp.endDate) : null,
              description: exp.description ?? null,
              sortOrder: exp.sortOrder
            }
          });
        }
      }
    });

    revalidatePath(PROFILE_PATH);
    revalidatePath(SETTINGS_PATH);
    result = { type: 'success', message: 'Опыт работы сохранён.' };
  } catch (error) {
    result = {
      type: 'error',
      message: resolveServerActionError({
        action: 'profile:update-work-experiences',
        error,
        zodMessage: 'Не удалось сохранить опыт работы. Проверьте поля.',
        known: [],
        fallbackMessage: 'Не удалось сохранить опыт работы. Попробуйте позже.'
      })
    };
  }

  const url = new URL(SETTINGS_PATH, 'http://localhost');
  url.searchParams.delete('success');
  url.searchParams.delete('error');
  url.searchParams.set(result.type, result.message);
  redirect(`${url.pathname}${url.search}`);
}

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

    // Create profile if user hasn't filled it in yet (all fields are optional)
    const profile = await prisma.profile.upsert({
      where: { userId: user.id },
      create: { userId: user.id },
      update: {},
      select: { id: true, avatarFileId: true }
    });

    // Capture old file ref for storage cleanup after successful swap
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

    // Atomically create new DB record, update profile FK, remove old DB record
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

      // Update profile before deleting old record to avoid FK cascade on SetNull
      await tx.profile.update({
        where: { id: profile.id },
        data: { avatarFileId: newUploadedFile.id }
      });

      if (profile.avatarFileId) {
        await tx.uploadedFile.delete({ where: { id: profile.avatarFileId } });
      }
    });

    // Transaction succeeded — no pending cleanup needed
    pendingStorageKey = undefined;

    // Best-effort cleanup of old storage file (non-critical)
    if (oldFile) {
      storageService
        .deleteFile({ fileKey: oldFile.fileKey, bucket: oldFile.bucket ?? undefined })
        .catch(() => {});
    }

    revalidatePath(PROFILE_PATH);
    revalidatePath(SETTINGS_PATH);
    result = { type: 'success', message: 'Аватар обновлён.' };
  } catch (error) {
    // Clean up the storage file if it was uploaded but the DB transaction failed
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

export async function updateProfileSkills(formData: FormData) {
  let result: { type: 'success' | 'error'; message: string };

  try {
    await assertSameOriginServerAction();
    const user = await getCurrentUser();

    if (!user) {
      redirect('/auth/login');
    }

    const profile = await prisma.profile.findUnique({ where: { userId: user.id }, select: { id: true } });

    if (!profile) {
      throw new Error('profile not found');
    }

    const skillIds = getArray(formData, 'skillIds');

    await prisma.$transaction(async (tx) => {
      await tx.profileSkill.deleteMany({ where: { profileId: profile.id } });

      if (skillIds.length > 0) {
        const validSkills = await tx.skill.findMany({
          where: { id: { in: skillIds }, isActive: true },
          select: { id: true }
        });

        if (validSkills.length > 0) {
          await tx.profileSkill.createMany({
            data: validSkills.map((s) => ({ profileId: profile.id, skillId: s.id }))
          });
        }
      }
    });

    revalidatePath(PROFILE_PATH);
    revalidatePath(SETTINGS_PATH);
    result = { type: 'success', message: 'Навыки сохранены.' };
  } catch (error) {
    result = {
      type: 'error',
      message: resolveServerActionError({
        action: 'profile:update-skills',
        error,
        zodMessage: 'Не удалось сохранить навыки.',
        known: [],
        fallbackMessage: 'Не удалось сохранить навыки. Попробуйте позже.'
      })
    };
  }

  const url = new URL(SETTINGS_PATH, 'http://localhost');
  url.searchParams.delete('success');
  url.searchParams.delete('error');
  url.searchParams.set(result.type, result.message);
  redirect(`${url.pathname}${url.search}`);
}

export async function changePassword(formData: FormData) {
  let result: { type: 'success' | 'error'; message: string };

  try {
    await assertSameOriginServerAction();
    const user = await getCurrentUser();

    if (!user) {
      redirect('/auth/login');
    }

    const parsed = changePasswordSchema.parse({
      currentPassword: getString(formData, 'currentPassword'),
      newPassword: getString(formData, 'newPassword'),
      confirmPassword: getString(formData, 'confirmPassword')
    });

    const fullUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { passwordHash: true }
    });

    if (!fullUser) {
      throw new Error('user not found');
    }

    const isValid = await verifyPassword(parsed.currentPassword, fullUser.passwordHash);

    if (!isValid) {
      throw new Error('current password is invalid');
    }

    const newPasswordHash = await hashPassword(parsed.newPassword);

    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash: newPasswordHash }
    });

    revalidatePath(SETTINGS_PATH);
    result = { type: 'success', message: 'Пароль изменён.' };
  } catch (error) {
    result = {
      type: 'error',
      message: resolveServerActionError({
        action: 'profile:change-password',
        error,
        zodMessage: 'Не удалось сменить пароль. Проверьте правильность текущего пароля.',
        known: [
          {
            matches: (e: Error) => e.message === 'current password is invalid',
            message: 'Текущий пароль указан неверно.'
          }
        ],
        fallbackMessage: 'Не удалось сменить пароль. Попробуйте позже.'
      })
    };
  }

  const url = new URL(SETTINGS_PATH, 'http://localhost');
  url.searchParams.delete('success');
  url.searchParams.delete('error');
  url.searchParams.set(result.type, result.message);
  redirect(`${url.pathname}${url.search}`);
}
