'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { assertSameOriginServerAction } from '@/lib/security/server-action-origin';
import { getCurrentUser } from '@/lib/auth/current-user';
import { setNotificationPreferences } from './preferences';

const topicPrefSchema = z.object({
  topics: z.array(z.object({
    topic: z.enum(['EVENTS', 'ARTICLES', 'VACANCIES', 'COURSES', 'SUPPLIERS']),
    enabled: z.coerce.boolean(),
  })).max(10),
});

export async function updateNotificationPreferences(formData: FormData) {
  try {
    await assertSameOriginServerAction();
    const user = await getCurrentUser();

    if (!user) {
      return { type: 'error' as const, message: 'Необходимо авторизоваться.' };
    }

    const topicsRaw = formData.getAll('topic').map(String);
    const enabledRaw = formData.getAll('enabled').map(String);
    const topics = topicPrefSchema.parse({
      topics: topicsRaw.map((topic, i) => ({
        topic,
        enabled: enabledRaw[i] === 'true',
      })),
    });

    await setNotificationPreferences(user.id, topics.topics);

    revalidatePath('/profile/settings');
    return { type: 'success' as const, message: 'Настройки уведомлений сохранены.' };
  } catch (error) {
    console.error('[preference-actions:updateNotificationPreferences]', error);
    return { type: 'error' as const, message: 'Не удалось сохранить настройки. Попробуйте позже.' };
  }
}
