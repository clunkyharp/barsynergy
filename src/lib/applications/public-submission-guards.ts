import { headers } from 'next/headers';
import { ApplicationType } from '@prisma/client';
import {
  getApplicationThrottleKeyHash,
  getClientIpFromHeaders,
  hasHoneypotValue
} from '@/lib/applications/submission-guard-utils';
import { prisma } from '@/lib/db/prisma';
import { consumeThrottleWindowAtomically } from '@/lib/security/throttle-window';
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
    ip: getClientIpFromHeaders(headerList)
  });
  const now = new Date();
  const windowBoundary = new Date(now.getTime() - THROTTLE_WINDOW_MS);

  await prisma.$transaction(async (tx) => {
    const slot = await consumeThrottleWindowAtomically(tx, {
      table: 'applicationSubmission',
      keyHash,
      maxAttempts: THROTTLE_MAX_SUBMISSIONS,
      now,
      windowBoundary
    });

    if (!slot) {
      throw new Error('application rate limit exceeded');
    }
  });
}
