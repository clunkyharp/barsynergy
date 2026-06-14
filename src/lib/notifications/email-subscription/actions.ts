'use server';

import { headers } from 'next/headers';
import { getString } from '@/lib/admin/content-utils';
import { getCurrentUser } from '@/lib/auth/current-user';
import { assertSameOriginServerAction } from '@/lib/security/server-action-origin';
import { createOrRefreshEmailSubscription } from './service';
import { newsletterSubscriptionSchema } from './schema';

export type NewsletterSubscriptionActionState =
  | { type: 'success'; message: string }
  | { type: 'error'; message: string }
  | null;

const RATE_LIMIT_IP_WINDOW_MS = 60_000;
const RATE_LIMIT_IP_MAX = 1;
const RATE_LIMIT_IP_HOUR_MAX = 5;
const RATE_LIMIT_EMAIL_DAY_MAX = 3;

const RATE_LIMIT_CLEANUP_THRESHOLD = 10_000;
// TODO: shared store (Upstash Redis) when scale > 1 instance

type RateEntry = { count: number; resetAt: number };

const ipRateMap = new Map<string, RateEntry>();
const emailRateMap = new Map<string, RateEntry>();

function cleanupExpiredEntries(map: Map<string, RateEntry>) {
  if (map.size <= RATE_LIMIT_CLEANUP_THRESHOLD) return;
  const now = Date.now();
  for (const [key, entry] of map) {
    if (now >= entry.resetAt) map.delete(key);
  }
}

function checkRateLimit(key: string, map: Map<string, RateEntry>, windowMs: number, max: number): boolean {
  cleanupExpiredEntries(map);
  const now = Date.now();
  const entry = map.get(key);

  if (!entry || now >= entry.resetAt) {
    map.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }

  if (entry.count >= max) {
    return false;
  }

  entry.count += 1;
  return true;
}

function extractClientIp(headersList: Headers): string {
  const ip =
    headersList.get('cf-connecting-ip') ??
    headersList.get('x-real-ip') ??
    headersList.get('x-forwarded-for')?.split(',')[0]?.trim();
  if (!ip) {
    console.warn('newsletter_submit: no client IP — rate-limit ineffective');
  }
  return ip ?? 'unknown';
}

export async function submitNewsletterSubscriptionAction(
  _prevState: NewsletterSubscriptionActionState,
  formData: FormData
): Promise<NewsletterSubscriptionActionState> {
  await assertSameOriginServerAction();

  const headersList = await headers();
  const ip = extractClientIp(headersList);

  if (!checkRateLimit(`ip:${ip}`, ipRateMap, RATE_LIMIT_IP_WINDOW_MS, RATE_LIMIT_IP_MAX)) {
    return { type: 'error', message: 'Слишком много попыток. Попробуйте через минуту.' };
  }

  if (!checkRateLimit(`ip:hour:${ip}`, ipRateMap, 3600_000, RATE_LIMIT_IP_HOUR_MAX)) {
    return { type: 'error', message: 'Слишком много попыток. Попробуйте через час.' };
  }

  const currentUser = await getCurrentUser();
  const formEmail = getString(formData, 'email');
  const email = currentUser?.email ?? formEmail;
  const consentAccepted = getString(formData, 'consent') === 'accepted';
  const topics = formData.getAll('topics').filter((value): value is string => typeof value === 'string');

  if (!consentAccepted) {
    return { type: 'error', message: 'Подтвердите согласие на обработку данных.' };
  }

  if (topics.length === 0) {
    return { type: 'error', message: 'Выберите хотя бы одну тему.' };
  }

  if (!email) {
    return { type: 'error', message: 'Введите корректный email.' };
  }

  const parsed = newsletterSubscriptionSchema.safeParse({
    email,
    topics,
    consentAccepted
  });

  if (!parsed.success) {
    const firstIssue = parsed.error.issues[0];
    if (firstIssue?.path[0] === 'email') {
      return { type: 'error', message: 'Введите корректный email.' };
    }
    if (firstIssue?.path[0] === 'topics') {
      return { type: 'error', message: 'Выберите хотя бы одну тему.' };
    }
    return { type: 'error', message: 'Проверьте данные формы.' };
  }

  if (!checkRateLimit(`email:${email}`, emailRateMap, 86_400_000, RATE_LIMIT_EMAIL_DAY_MAX)) {
    return { type: 'error', message: 'Слишком много попыток для этого email. Попробуйте завтра.' };
  }

  try {
    await createOrRefreshEmailSubscription({
      email: parsed.data.email,
      topics: parsed.data.topics,
      userId: currentUser?.id
    });

    console.info('newsletter_modal_submitted', {
      topics: parsed.data.topics,
      hasAccount: Boolean(currentUser)
    });

    return {
      type: 'success',
      message: 'Проверьте почту — отправили ссылку для подтверждения.'
    };
  } catch {
    return {
      type: 'error',
      message: 'Не удалось оформить подписку. Попробуйте позже.'
    };
  }
}
