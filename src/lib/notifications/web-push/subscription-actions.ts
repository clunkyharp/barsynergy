'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { assertSameOriginServerAction } from '@/lib/security/server-action-origin';
import { getCurrentUser } from '@/lib/auth/current-user';
import { saveSubscription, disableUserSubscriptionByEndpoint } from './subscriptions';

const subscribeSchema = z.object({
  endpoint: z.string().url(),
  p256dh: z.string().min(1),
  auth: z.string().min(1),
  userAgent: z.string().optional(),
});

export async function subscribeUserToPush(formData: FormData) {
  try {
    await assertSameOriginServerAction();
    const user = await getCurrentUser();

    if (!user) {
      return { type: 'error' as const, message: 'Необходимо авторизоваться.' };
    }

    const parsed = subscribeSchema.parse({
      endpoint: formData.get('endpoint'),
      p256dh: formData.get('p256dh'),
      auth: formData.get('auth'),
      userAgent: formData.get('userAgent'),
    });

    await saveSubscription(user.id, parsed);

    revalidatePath('/profile/settings');
    return { type: 'success' as const, message: 'Подписка на уведомления сохранена.' };
  } catch (error) {
    console.error('[subscription-actions:subscribeUserToPush]', error);
    return { type: 'error' as const, message: 'Не удалось сохранить подписку. Попробуйте позже.' };
  }
}

export async function unsubscribeUserFromPush(formData: FormData) {
  try {
    await assertSameOriginServerAction();
    const user = await getCurrentUser();

    if (!user) {
      return { type: 'error' as const, message: 'Необходимо авторизоваться.' };
    }

    const endpoint = formData.get('endpoint');

    if (typeof endpoint !== 'string' || !endpoint) {
      return { type: 'error' as const, message: 'Неверный endpoint.' };
    }

    await disableUserSubscriptionByEndpoint(user.id, endpoint);

    revalidatePath('/profile/settings');
    return { type: 'success' as const, message: 'Подписка отключена.' };
  } catch (error) {
    console.error('[subscription-actions:unsubscribeUserFromPush]', error);
    return { type: 'error' as const, message: 'Не удалось отключить подписку. Попробуйте позже.' };
  }
}
