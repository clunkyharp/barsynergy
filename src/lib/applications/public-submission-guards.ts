import { headers } from 'next/headers';
import { ApplicationType } from '@prisma/client';
import {
  getApplicationThrottleKeyHash,
  getClientIpFromHeaders,
  hasHoneypotValue
} from '@/lib/applications/submission-guard-utils';
import { prisma } from '@/lib/db/prisma';
import { getEnv } from '@/lib/validation/env';
import { arePublicApplicationFormsEnabled } from '@/lib/applications/public-forms';

const THROTTLE_WINDOW_MS = 15 * 60 * 1000;
const THROTTLE_MAX_SUBMISSIONS = 5;

export { getApplicationThrottleKeyHash, getClientIpFromHeaders, hasHoneypotValue };

export function assertPublicApplicationFormsEnabled() {
  if (!arePublicApplicationFormsEnabled(getEnv())) {
    throw new Error('application forms are disabled');
  }
}

export async function assertPublicApplicationSubmissionAllowed(applicationType: ApplicationType) {
  const headerList = await headers();
  const keyHash = getApplicationThrottleKeyHash({
    applicationType,
    ip: getClientIpFromHeaders(headerList),
    userAgent: headerList.get('user-agent')?.trim() ?? 'unknown'
  });
  const now = new Date();
  const windowBoundary = new Date(now.getTime() - THROTTLE_WINDOW_MS);

  await prisma.$transaction(async (tx) => {
    const existing = await tx.applicationSubmissionThrottle.findUnique({
      where: { keyHash },
      select: { count: true, windowStartedAt: true }
    });

    if (!existing || existing.windowStartedAt <= windowBoundary) {
      await tx.applicationSubmissionThrottle.upsert({
        where: { keyHash },
        create: { keyHash, count: 1, windowStartedAt: now },
        update: { count: 1, windowStartedAt: now }
      });
      return;
    }

    if (existing.count >= THROTTLE_MAX_SUBMISSIONS) {
      throw new Error('application rate limit exceeded');
    }

    await tx.applicationSubmissionThrottle.update({
      where: { keyHash },
      data: { count: { increment: 1 } }
    });
  });
}
