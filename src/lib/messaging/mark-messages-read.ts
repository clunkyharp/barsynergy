'use server';

import { revalidatePath } from 'next/cache';
import { ConversationSender } from '@prisma/client';
import { assertSameOriginServerAction } from '@/lib/security/server-action-origin';
import { getCurrentUser } from '@/lib/auth/current-user';
import { prisma } from '@/lib/db/prisma';

type MarkReadResult =
  | { type: 'success' }
  | { type: 'error'; message: string };

export async function markConversationMessagesRead(
  applicationId: string,
  readerRole: 'user' | 'business' | 'admin'
): Promise<MarkReadResult> {
  try {
    await assertSameOriginServerAction();

    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return { type: 'error', message: 'Необходима авторизация.' };
    }

    const application = await prisma.application.findUnique({
      where: { id: applicationId },
      select: {
        id: true,
        userId: true,
        vacancy: { select: { createdById: true } }
      }
    });

    if (!application) {
      return { type: 'error', message: 'Заявка не найдена.' };
    }

    const isAdmin = currentUser.role === 'ADMIN' || currentUser.role === 'MODERATOR';

    if (readerRole === 'user' && !isAdmin) {
      if (application.userId !== currentUser.id) {
        return { type: 'error', message: 'Нет доступа к этому диалогу.' };
      }
    } else if (readerRole === 'business' && !isAdmin) {
      if (application.vacancy?.createdById !== currentUser.id) {
        return { type: 'error', message: 'Нет доступа к этому диалогу.' };
      }
    }

    await prisma.$transaction(async (tx) => {
      if (readerRole === 'user' || isAdmin) {
        await tx.conversationMessage.updateMany({
          where: {
            applicationId,
            isReadByUser: false,
            senderRole: { not: ConversationSender.USER }
          },
          data: { isReadByUser: true }
        });

        await tx.application.update({
          where: { id: applicationId },
          data: { hasUnreadForUser: false }
        });
      }

      if (readerRole === 'business' || isAdmin) {
        await tx.conversationMessage.updateMany({
          where: {
            applicationId,
            isReadByBusiness: false,
            senderRole: { not: ConversationSender.BUSINESS }
          },
          data: { isReadByBusiness: true }
        });

        await tx.application.update({
          where: { id: applicationId },
          data: { hasUnreadForBusiness: false }
        });
      }
    });

    revalidatePath(`/profile/responses/${applicationId}`);
    revalidatePath(`/business/cabinet/responses/${applicationId}`);
    revalidatePath(`/admin/applications/${applicationId}`);
    revalidatePath('/profile/responses');
    revalidatePath('/business/cabinet/responses');
    revalidatePath('/profile/inquiries');
    revalidatePath(`/profile/inquiries/${applicationId}`);

    return { type: 'success' };
  } catch (error) {
    if (error instanceof Error && error.message === 'same origin required') {
      return { type: 'error', message: 'Ошибка безопасности.' };
    }
    console.error('[mark-conversation-messages-read]', error);
    return { type: 'error', message: 'Не удалось пометить сообщения прочитанными.' };
  }
}
