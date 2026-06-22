'use server';

import type { NotificationTopic } from '@prisma/client';
import { getString } from '@/lib/forms/form-data';
import { getCurrentUser } from '@/lib/auth/current-user';
import { assertSameOriginServerAction } from '@/lib/security/server-action-origin';
import { createOrRefreshEmailSubscription } from './service';

export type ContentSubscribeState =
  | { type: 'success'; message: string }
  | { type: 'error'; message: string }
  | null;

export async function subscribeToContentAction(
  _prevState: ContentSubscribeState,
  formData: FormData
): Promise<ContentSubscribeState> {
  await assertSameOriginServerAction();

  const email = getString(formData, 'email');
  const topic = getString(formData, 'topic');

  if (!topic) {
    return { type: 'error', message: 'Не указана тема подписки.' };
  }

  const currentUser = await getCurrentUser();
  const resolvedEmail = currentUser?.email ?? email;

  if (!resolvedEmail) {
    return { type: 'error', message: 'Укажите email для получения уведомлений.' };
  }

  try {
    await createOrRefreshEmailSubscription({
      email: resolvedEmail,
      topics: [topic as NotificationTopic],
      userId: currentUser?.id
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
