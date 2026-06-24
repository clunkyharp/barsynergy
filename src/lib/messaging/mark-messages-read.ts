'use server';

import { revalidatePath } from 'next/cache';
import { ConversationSender } from '@prisma/client';
import { assertSameOriginServerAction } from '@/lib/security/server-action-origin';
import { getCurrentUser } from '@/lib/auth/current-user';
import { prisma } from '@/lib/db/prisma';

type MarkReadResult =
  | { type: 'success' }
  | { type: 'error'; message: string };

type DerivedRole = 'user' | 'business' | 'admin';

function deriveReaderRole(currentUser: { id: string; role: string }, application: {
  userId: string | null;
  vacancy: {
    createdById: string | null;
    businessAccount: { ownerId: string } | null;
  } | null;
  businessAccount: { ownerId: string } | null;
}): DerivedRole | null {
  if (currentUser.role === 'ADMIN' || currentUser.role === 'MODERATOR') {
    return 'admin';
  }
  if (application.userId === currentUser.id) {
    return 'user';
  }
  if (
    application.vacancy?.createdById === currentUser.id ||
    application.vacancy?.businessAccount?.ownerId === currentUser.id ||
    application.businessAccount?.ownerId === currentUser.id
  ) {
    return 'business';
  }
  return null;
}

function businessOwnershipWhere(userId: string) {
  return {
    OR: [
      { vacancy: { createdById: userId } },
      { vacancy: { businessAccount: { ownerId: userId } } },
      { businessAccount: { ownerId: userId } }
    ]
  };
}

export async function markConversationMessagesRead(
  applicationId: string
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
        businessAccount: { select: { ownerId: true } },
        vacancy: {
          select: {
            createdById: true,
            businessAccount: { select: { ownerId: true } }
          }
        }
      }
    });

    if (!application) {
      return { type: 'error', message: 'Заявка не найдена.' };
    }

    const readerRole = deriveReaderRole(currentUser, application);

    if (!readerRole) {
      return { type: 'error', message: 'Нет доступа к этому диалогу.' };
    }

    const isAdmin = readerRole === 'admin';

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

        const result = await tx.application.updateMany({
          where: {
            id: applicationId,
            ...(readerRole === 'user' ? { userId: currentUser.id } : {})
          },
          data: { hasUnreadForUser: false }
        });

        if (result.count === 0 && !isAdmin) {
          throw new Error('ownership check failed');
        }
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

        const result = await tx.application.updateMany({
          where: {
            id: applicationId,
            ...(readerRole === 'business' ? businessOwnershipWhere(currentUser.id) : {})
          },
          data: { hasUnreadForBusiness: false }
        });

        if (result.count === 0 && !isAdmin) {
          throw new Error('ownership check failed');
        }
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
