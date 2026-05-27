'use server';

import { revalidatePath } from 'next/cache';
import { ContentStatus } from '@prisma/client';
import { z } from 'zod';
import {
  contentStatusValues,
  formatAdminActionError,
  getString,
  initialPublicationDates,
  nullableString,
  optionalString,
  redirectWithAdminActionResult,
  safeAdminRedirectPath,
  statusTransitionDates
} from '@/lib/admin/content-utils';
import { requireAdminSectionAccess } from '@/lib/auth/require-admin-section';
import { prisma } from '@/lib/db/prisma';
import { assertSameOriginServerAction } from '@/lib/security/server-action-origin';
import { normalizeExternalUrlInput } from '@/lib/validation/external-url';

const ADMIN_HOMEPAGE_PATH = '/admin/homepage';

const statusSchema = z.enum(contentStatusValues).default(ContentStatus.DRAFT);

const heroSchema = z.object({
  heroId: z.string().trim().optional(),
  status: statusSchema,
  eyebrow: z.string().trim().min(2).max(160),
  title: z.string().trim().min(2).max(220),
  description: z.string().trim().min(10).max(700),
  signalsText: z.string().trim().max(2000).optional(),
  priority: z.coerce.number().int().min(0).max(100_000).default(0)
});

const audienceSchema = z.object({
  cardId: z.string().trim().optional(),
  status: statusSchema,
  title: z.string().trim().min(2).max(160),
  description: z.string().trim().min(10).max(700),
  href: z.string().trim().min(1).max(500),
  actionLabel: z.string().trim().min(2).max(120),
  proof: z.string().trim().max(240).optional(),
  imagePath: z.string().trim().max(500).optional(),
  iconKey: z.string().trim().max(80).optional(),
  priority: z.coerce.number().int().min(0).max(100_000).default(0)
});

const socialSchema = z.object({
  socialId: z.string().trim().optional(),
  status: statusSchema,
  name: z.string().trim().min(2).max(120),
  title: z.string().trim().min(2).max(160),
  description: z.string().trim().min(10).max(700),
  helperText: z.string().trim().max(160).optional(),
  actionLabel: z.string().trim().min(2).max(120),
  href: z.string().trim().min(1).max(500),
  logoPath: z.string().trim().max(500).optional(),
  variant: z.string().trim().max(80).optional(),
  priority: z.coerce.number().int().min(0).max(100_000).default(0)
});

const ctaSchema = z.object({
  ctaId: z.string().trim().optional(),
  status: statusSchema,
  title: z.string().trim().min(2).max(220),
  description: z.string().trim().min(10).max(700),
  helperText: z.string().trim().max(180).optional(),
  primaryLabel: z.string().trim().min(2).max(120),
  primaryHref: z.string().trim().min(1).max(500),
  secondaryLabel: z.string().trim().max(120).optional(),
  secondaryHref: z.string().trim().max(500).optional(),
  priority: z.coerce.number().int().min(0).max(100_000).default(0)
});

const calculatorSchema = z.object({
  calculatorId: z.string().trim().optional(),
  status: statusSchema,
  eyebrow: z.string().trim().min(2).max(120),
  title: z.string().trim().min(2).max(180),
  cardEyebrow: z.string().trim().min(2).max(120),
  cardTitle: z.string().trim().min(2).max(220),
  description: z.string().trim().min(10).max(700),
  stepsText: z.string().trim().max(1200).optional(),
  actionLabel: z.string().trim().min(2).max(120),
  actionHref: z.string().trim().min(1).max(500),
  priority: z.coerce.number().int().min(0).max(100_000).default(0)
});

const deleteSchema = z.object({
  id: z.string().trim().min(1)
});

function normalizePublicAssetPath(value?: string) {
  const trimmed = value?.trim();

  if (!trimmed) {
    return undefined;
  }

  if (!trimmed.startsWith('/') || trimmed.startsWith('//') || trimmed.includes('..')) {
    throw new Error('public asset path is invalid');
  }

  return trimmed;
}

function normalizeHomepageLink(value: string) {
  const trimmed = value.trim();

  if (trimmed.startsWith('/') && !trimmed.startsWith('//') && !trimmed.includes('..')) {
    return trimmed;
  }

  const external = normalizeExternalUrlInput(trimmed);

  if (!external) {
    throw new Error('homepage link is invalid');
  }

  return external;
}

function revalidateHomepagePaths() {
  revalidatePath(ADMIN_HOMEPAGE_PATH);
  revalidatePath('/');
}

function redirectTarget(formData: FormData) {
  return safeAdminRedirectPath(formData, ADMIN_HOMEPAGE_PATH, [ADMIN_HOMEPAGE_PATH]);
}

function resultMessage(action: 'created' | 'updated' | 'deleted') {
  if (action === 'created') return 'Запись создана.';
  if (action === 'deleted') return 'Запись удалена.';
  return 'Запись обновлена.';
}

async function assertCanDeleteHomepageRecord<T extends { status: ContentStatus } | null>(record: T) {
  if (!record) {
    throw new Error('draft is invalid');
  }

  if (record.status !== ContentStatus.DRAFT) {
    throw new Error('draft is invalid');
  }
}

export async function saveHomepageHero(formData: FormData) {
  const redirectTo = redirectTarget(formData);
  let result: { type: 'success' | 'error'; message: string };

  try {
    await assertSameOriginServerAction();
    const user = await requireAdminSectionAccess('homepage');
    const parsed = heroSchema.parse({
      heroId: optionalString(getString(formData, 'heroId')),
      status: getString(formData, 'status') || ContentStatus.DRAFT,
      eyebrow: getString(formData, 'eyebrow'),
      title: getString(formData, 'title'),
      description: getString(formData, 'description'),
      signalsText: optionalString(getString(formData, 'signalsText')),
      priority: getString(formData, 'priority') || '0'
    });

    if (parsed.heroId) {
      const current = await prisma.homepageHero.findUnique({ where: { id: parsed.heroId }, select: { publishedAt: true } });
      await prisma.homepageHero.update({
        where: { id: parsed.heroId },
        data: {
          status: parsed.status,
          eyebrow: parsed.eyebrow,
          title: parsed.title,
          description: parsed.description,
          signalsText: nullableString(parsed.signalsText),
          priority: parsed.priority,
          updatedById: user.id,
          ...statusTransitionDates(parsed.status, current?.publishedAt ?? null)
        }
      });
      result = { type: 'success', message: resultMessage('updated') };
    } else {
      await prisma.homepageHero.create({
        data: {
          status: parsed.status,
          eyebrow: parsed.eyebrow,
          title: parsed.title,
          description: parsed.description,
          signalsText: nullableString(parsed.signalsText),
          priority: parsed.priority,
          createdById: user.id,
          updatedById: user.id,
          ...initialPublicationDates(parsed.status)
        }
      });
      result = { type: 'success', message: resultMessage('created') };
    }

    revalidateHomepagePaths();
  } catch (error) {
    result = { type: 'error', message: formatAdminActionError(error) };
  }

  redirectWithAdminActionResult(redirectTo, result);
}

export async function saveHomepageAudienceCard(formData: FormData) {
  const redirectTo = redirectTarget(formData);
  let result: { type: 'success' | 'error'; message: string };

  try {
    await assertSameOriginServerAction();
    const user = await requireAdminSectionAccess('homepage');
    const parsed = audienceSchema.parse({
      cardId: optionalString(getString(formData, 'cardId')),
      status: getString(formData, 'status') || ContentStatus.DRAFT,
      title: getString(formData, 'title'),
      description: getString(formData, 'description'),
      href: getString(formData, 'href'),
      actionLabel: getString(formData, 'actionLabel'),
      proof: optionalString(getString(formData, 'proof')),
      imagePath: optionalString(getString(formData, 'imagePath')),
      iconKey: optionalString(getString(formData, 'iconKey')),
      priority: getString(formData, 'priority') || '0'
    });
    const data = {
      status: parsed.status,
      title: parsed.title,
      description: parsed.description,
      href: normalizeHomepageLink(parsed.href),
      actionLabel: parsed.actionLabel,
      proof: nullableString(parsed.proof),
      imagePath: nullableString(normalizePublicAssetPath(parsed.imagePath)),
      iconKey: nullableString(parsed.iconKey),
      priority: parsed.priority,
      updatedById: user.id
    };

    if (parsed.cardId) {
      const current = await prisma.homepageAudienceCard.findUnique({ where: { id: parsed.cardId }, select: { publishedAt: true } });
      await prisma.homepageAudienceCard.update({
        where: { id: parsed.cardId },
        data: { ...data, ...statusTransitionDates(parsed.status, current?.publishedAt ?? null) }
      });
      result = { type: 'success', message: resultMessage('updated') };
    } else {
      await prisma.homepageAudienceCard.create({
        data: { ...data, createdById: user.id, ...initialPublicationDates(parsed.status) }
      });
      result = { type: 'success', message: resultMessage('created') };
    }

    revalidateHomepagePaths();
  } catch (error) {
    result = { type: 'error', message: formatAdminActionError(error) };
  }

  redirectWithAdminActionResult(redirectTo, result);
}

export async function saveHomepageSocialBlock(formData: FormData) {
  const redirectTo = redirectTarget(formData);
  let result: { type: 'success' | 'error'; message: string };

  try {
    await assertSameOriginServerAction();
    const user = await requireAdminSectionAccess('homepage');
    const parsed = socialSchema.parse({
      socialId: optionalString(getString(formData, 'socialId')),
      status: getString(formData, 'status') || ContentStatus.DRAFT,
      name: getString(formData, 'name'),
      title: getString(formData, 'title'),
      description: getString(formData, 'description'),
      helperText: optionalString(getString(formData, 'helperText')),
      actionLabel: getString(formData, 'actionLabel'),
      href: getString(formData, 'href'),
      logoPath: optionalString(getString(formData, 'logoPath')),
      variant: optionalString(getString(formData, 'variant')),
      priority: getString(formData, 'priority') || '0'
    });
    const data = {
      status: parsed.status,
      name: parsed.name,
      title: parsed.title,
      description: parsed.description,
      helperText: nullableString(parsed.helperText),
      actionLabel: parsed.actionLabel,
      href: normalizeHomepageLink(parsed.href),
      logoPath: nullableString(normalizePublicAssetPath(parsed.logoPath)),
      variant: nullableString(parsed.variant),
      priority: parsed.priority,
      updatedById: user.id
    };

    if (parsed.socialId) {
      const current = await prisma.homepageSocialBlock.findUnique({ where: { id: parsed.socialId }, select: { publishedAt: true } });
      await prisma.homepageSocialBlock.update({
        where: { id: parsed.socialId },
        data: { ...data, ...statusTransitionDates(parsed.status, current?.publishedAt ?? null) }
      });
      result = { type: 'success', message: resultMessage('updated') };
    } else {
      await prisma.homepageSocialBlock.create({
        data: { ...data, createdById: user.id, ...initialPublicationDates(parsed.status) }
      });
      result = { type: 'success', message: resultMessage('created') };
    }

    revalidateHomepagePaths();
  } catch (error) {
    result = { type: 'error', message: formatAdminActionError(error) };
  }

  redirectWithAdminActionResult(redirectTo, result);
}

export async function saveHomepageCtaBlock(formData: FormData) {
  const redirectTo = redirectTarget(formData);
  let result: { type: 'success' | 'error'; message: string };

  try {
    await assertSameOriginServerAction();
    const user = await requireAdminSectionAccess('homepage');
    const parsed = ctaSchema.parse({
      ctaId: optionalString(getString(formData, 'ctaId')),
      status: getString(formData, 'status') || ContentStatus.DRAFT,
      title: getString(formData, 'title'),
      description: getString(formData, 'description'),
      helperText: optionalString(getString(formData, 'helperText')),
      primaryLabel: getString(formData, 'primaryLabel'),
      primaryHref: getString(formData, 'primaryHref'),
      secondaryLabel: optionalString(getString(formData, 'secondaryLabel')),
      secondaryHref: optionalString(getString(formData, 'secondaryHref')),
      priority: getString(formData, 'priority') || '0'
    });
    const data = {
      status: parsed.status,
      title: parsed.title,
      description: parsed.description,
      helperText: nullableString(parsed.helperText),
      primaryLabel: parsed.primaryLabel,
      primaryHref: normalizeHomepageLink(parsed.primaryHref),
      secondaryLabel: nullableString(parsed.secondaryLabel),
      secondaryHref: nullableString(parsed.secondaryHref ? normalizeHomepageLink(parsed.secondaryHref) : undefined),
      priority: parsed.priority,
      updatedById: user.id
    };

    if (parsed.ctaId) {
      const current = await prisma.homepageCtaBlock.findUnique({ where: { id: parsed.ctaId }, select: { publishedAt: true } });
      await prisma.homepageCtaBlock.update({
        where: { id: parsed.ctaId },
        data: { ...data, ...statusTransitionDates(parsed.status, current?.publishedAt ?? null) }
      });
      result = { type: 'success', message: resultMessage('updated') };
    } else {
      await prisma.homepageCtaBlock.create({
        data: { ...data, createdById: user.id, ...initialPublicationDates(parsed.status) }
      });
      result = { type: 'success', message: resultMessage('created') };
    }

    revalidateHomepagePaths();
  } catch (error) {
    result = { type: 'error', message: formatAdminActionError(error) };
  }

  redirectWithAdminActionResult(redirectTo, result);
}

export async function saveHomepageCalculatorTeaser(formData: FormData) {
  const redirectTo = redirectTarget(formData);
  let result: { type: 'success' | 'error'; message: string };

  try {
    await assertSameOriginServerAction();
    const user = await requireAdminSectionAccess('homepage');
    const parsed = calculatorSchema.parse({
      calculatorId: optionalString(getString(formData, 'calculatorId')),
      status: getString(formData, 'status') || ContentStatus.DRAFT,
      eyebrow: getString(formData, 'eyebrow'),
      title: getString(formData, 'title'),
      cardEyebrow: getString(formData, 'cardEyebrow'),
      cardTitle: getString(formData, 'cardTitle'),
      description: getString(formData, 'description'),
      stepsText: optionalString(getString(formData, 'stepsText')),
      actionLabel: getString(formData, 'actionLabel'),
      actionHref: getString(formData, 'actionHref'),
      priority: getString(formData, 'priority') || '0'
    });
    const data = {
      status: parsed.status,
      eyebrow: parsed.eyebrow,
      title: parsed.title,
      cardEyebrow: parsed.cardEyebrow,
      cardTitle: parsed.cardTitle,
      description: parsed.description,
      stepsText: nullableString(parsed.stepsText),
      actionLabel: parsed.actionLabel,
      actionHref: normalizeHomepageLink(parsed.actionHref),
      priority: parsed.priority,
      updatedById: user.id
    };

    if (parsed.calculatorId) {
      const current = await prisma.homepageCalculatorTeaser.findUnique({ where: { id: parsed.calculatorId }, select: { publishedAt: true } });
      await prisma.homepageCalculatorTeaser.update({
        where: { id: parsed.calculatorId },
        data: { ...data, ...statusTransitionDates(parsed.status, current?.publishedAt ?? null) }
      });
      result = { type: 'success', message: resultMessage('updated') };
    } else {
      await prisma.homepageCalculatorTeaser.create({
        data: { ...data, createdById: user.id, ...initialPublicationDates(parsed.status) }
      });
      result = { type: 'success', message: resultMessage('created') };
    }

    revalidateHomepagePaths();
  } catch (error) {
    result = { type: 'error', message: formatAdminActionError(error) };
  }

  redirectWithAdminActionResult(redirectTo, result);
}

export async function deleteHomepageAudienceCard(formData: FormData) {
  const redirectTo = redirectTarget(formData);
  let result: { type: 'success' | 'error'; message: string };

  try {
    await assertSameOriginServerAction();
    await requireAdminSectionAccess('homepage');
    const parsed = deleteSchema.parse({ id: getString(formData, 'id') });
    const current = await prisma.homepageAudienceCard.findUnique({ where: { id: parsed.id }, select: { status: true } });
    await assertCanDeleteHomepageRecord(current);
    await prisma.homepageAudienceCard.delete({ where: { id: parsed.id } });
    revalidateHomepagePaths();
    result = { type: 'success', message: resultMessage('deleted') };
  } catch (error) {
    result = { type: 'error', message: formatAdminActionError(error) };
  }

  redirectWithAdminActionResult(redirectTo, result);
}

export async function deleteHomepageSocialBlock(formData: FormData) {
  const redirectTo = redirectTarget(formData);
  let result: { type: 'success' | 'error'; message: string };

  try {
    await assertSameOriginServerAction();
    await requireAdminSectionAccess('homepage');
    const parsed = deleteSchema.parse({ id: getString(formData, 'id') });
    const current = await prisma.homepageSocialBlock.findUnique({ where: { id: parsed.id }, select: { status: true } });
    await assertCanDeleteHomepageRecord(current);
    await prisma.homepageSocialBlock.delete({ where: { id: parsed.id } });
    revalidateHomepagePaths();
    result = { type: 'success', message: resultMessage('deleted') };
  } catch (error) {
    result = { type: 'error', message: formatAdminActionError(error) };
  }

  redirectWithAdminActionResult(redirectTo, result);
}
