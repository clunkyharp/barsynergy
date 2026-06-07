'use server';

import { revalidatePath } from 'next/cache';
import { after } from 'next/dist/server/after';
import { ApplicationStatus, ConversationSender } from '@prisma/client';
import { assertSameOriginServerAction } from '@/lib/security/server-action-origin';
import { getCurrentUser } from '@/lib/auth/current-user';
import { prisma } from '@/lib/db/prisma';
import { dispatchMessageNotificationQueue } from './notifications/message-notification-outbox';

const MAX_MESSAGE_LENGTH = 2000;
const MIN_MESSAGE_LENGTH = 1;

const CLOSED_STATUSES: ApplicationStatus[] = [
  ApplicationStatus.COMPLETED,
  ApplicationStatus.REJECTED,
  ApplicationStatus.ARCHIVED
];

type SendResult =
  | { type: 'success'; messageId: string }
  | { type: 'error'; message: string };

export async function sendConversationMessage(input: {
  applicationId: string;
  body: string;
  senderRole: ConversationSender;
}): Promise<SendResult> {
  try {
    await assertSameOriginServerAction();

    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return { type: 'error', message: 'Необходима авторизация.' };
    }

    const body = input.body.trim();
    if (body.length < MIN_MESSAGE_LENGTH) {
      return { type: 'error', message: 'Сообщение не может быть пустым.' };
    }
    if (body.length > MAX_MESSAGE_LENGTH) {
      return { type: 'error', message: `Максимальная длина сообщения — ${MAX_MESSAGE_LENGTH} символов.` };
    }

    const application = await prisma.application.findUnique({
      where: { id: input.applicationId },
      select: {
        id: true,
        status: true,
        userId: true,
        businessAccountId: true,
        vacancy: { select: { createdById: true, businessAccountId: true } }
      }
    });

    if (!application) {
      return { type: 'error', message: 'Заявка не найдена.' };
    }

    if (CLOSED_STATUSES.includes(application.status)) {
      return { type: 'error', message: 'Заявка закрыта, переписка недоступна.' };
    }

    const hasAccess = await checkConversationAccess(
      application.id,
      currentUser.id,
      currentUser.role,
      input.senderRole
    );

    if (!hasAccess) {
      return { type: 'error', message: 'Нет доступа к этому диалогу.' };
    }

    const result = await prisma.$transaction(async (tx) => {
      const message = await tx.conversationMessage.create({
        data: {
          applicationId: application.id,
          authorId: currentUser.id,
          senderRole: input.senderRole,
          body
        },
        select: { id: true }
      });

      const unreadUpdate =
        input.senderRole === ConversationSender.USER
          ? { hasUnreadForBusiness: true, hasUnreadForUser: false }
          : input.senderRole === ConversationSender.BUSINESS
            ? { hasUnreadForUser: true, hasUnreadForBusiness: false }
            : { hasUnreadForUser: true, hasUnreadForBusiness: true };

      await tx.application.update({
        where: { id: application.id },
        data: {
          ...unreadUpdate,
          lastMessageAt: new Date(),
          ...(application.status === ApplicationStatus.NEW && input.senderRole === ConversationSender.BUSINESS
            ? { status: ApplicationStatus.CONTACTED }
            : application.status === ApplicationStatus.NEW && input.senderRole === ConversationSender.ADMIN
              ? { status: ApplicationStatus.IN_REVIEW }
              : {})
        }
      });

      return message;
    });

    revalidatePath(`/profile/responses/${application.id}`);
    revalidatePath(`/business/cabinet/responses/${application.id}`);
    revalidatePath(`/admin/applications/${application.id}`);
    revalidatePath('/profile/responses');
    revalidatePath('/business/cabinet/responses');
    revalidatePath('/profile/inquiries');
    revalidatePath(`/profile/inquiries/${application.id}`);

    after(() => {
      dispatchMessageNotificationQueue({ applicationId: application.id });
    });

    return { type: 'success', messageId: result.id };
  } catch (error) {
    if (error instanceof Error && error.message === 'same origin required') {
      return { type: 'error', message: 'Ошибка безопасности.' };
    }
    console.error('[send-conversation-message]', error);
    return { type: 'error', message: 'Не удалось отправить сообщение.' };
  }
}

async function checkConversationAccess(
  applicationId: string,
  userId: string,
  userRole: string,
  senderRole: ConversationSender
): Promise<boolean> {
  if (userRole === 'ADMIN' || userRole === 'MODERATOR') {
    return senderRole === ConversationSender.ADMIN;
  }

  if (senderRole === ConversationSender.USER) {
    const owned = await prisma.application.findFirst({
      where: { id: applicationId, userId },
      select: { id: true }
    });
    return owned !== null;
  }

  if (senderRole === ConversationSender.BUSINESS) {
    const owned = await prisma.application.findFirst({
      where: {
        id: applicationId,
        vacancy: { createdById: userId }
      },
      select: { id: true }
    });
    return owned !== null;
  }

  return false;
}
