import type { NotificationTopic } from '@prisma/client';
import { prisma } from '@/lib/db/prisma';
import { getEnv } from '@/lib/validation/env';
import { NEWSLETTER_CONSENT_TEXT, NEWSLETTER_CONSENT_VERSION } from './schema';
import { createEmailSubscriptionToken, hashEmailSubscriptionToken } from './tokens';
import { sendNewsletterConfirmEmail } from './emails';

export async function hasActiveEmailSubscriptionForUser(userId: string) {
  const subscription = await prisma.emailSubscription.findFirst({
    where: {
      userId,
      confirmedAt: { not: null },
      unsubscribedAt: null
    },
    select: { id: true }
  });

  return Boolean(subscription);
}

export async function createOrRefreshEmailSubscription({
  email,
  topics,
  userId
}: {
  email: string;
  topics: NotificationTopic[];
  userId?: string;
}) {
  const existing = await prisma.emailSubscription.findUnique({
    where: { email },
    select: { confirmedAt: true }
  });
  const wasConfirmed = existing?.confirmedAt != null;

  if (wasConfirmed) {
    await prisma.emailSubscription.update({
      where: { email },
      data: {
        userId,
        topics,
        unsubscribedAt: null,
        consentText: NEWSLETTER_CONSENT_TEXT,
        consentVersion: NEWSLETTER_CONSENT_VERSION
      }
    });
    return;
  }

  const confirmToken = createEmailSubscriptionToken();
  const unsubToken = createEmailSubscriptionToken();

  await prisma.emailSubscription.upsert({
    where: { email },
    create: {
      email,
      userId,
      topics,
      confirmTokenHash: confirmToken.tokenHash,
      unsubTokenHash: unsubToken.tokenHash,
      consentText: NEWSLETTER_CONSENT_TEXT,
      consentVersion: NEWSLETTER_CONSENT_VERSION
    },
    update: {
      userId,
      topics,
      confirmTokenHash: confirmToken.tokenHash,
      unsubTokenHash: unsubToken.tokenHash,
      confirmedAt: null,
      unsubscribedAt: null,
      consentText: NEWSLETTER_CONSENT_TEXT,
      consentVersion: NEWSLETTER_CONSENT_VERSION
    }
  });

  const env = getEnv();
  const confirmUrl = `${env.APP_URL}/newsletter/confirm/${confirmToken.rawToken}`;
  await sendNewsletterConfirmEmail({ to: email, confirmUrl });
}

export async function confirmEmailSubscription(token: string) {
  const tokenHash = hashEmailSubscriptionToken(token);

  const updated = await prisma.emailSubscription.updateMany({
    where: {
      confirmTokenHash: tokenHash,
      unsubscribedAt: null
    },
    data: {
      confirmedAt: new Date()
    }
  });

  return updated.count > 0;
}

export async function unsubscribeEmailSubscription(token: string) {
  const tokenHash = hashEmailSubscriptionToken(token);

  const updated = await prisma.emailSubscription.updateMany({
    where: {
      unsubTokenHash: tokenHash,
      unsubscribedAt: null
    },
    data: {
      unsubscribedAt: new Date()
    }
  });

  return updated.count > 0;
}
