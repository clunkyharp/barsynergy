'use server';

import { revalidatePath } from 'next/cache';
import { after } from 'next/dist/server/after';
import { ApplicationNotificationChannel, ApplicationStatus, ApplicationType, ConversationSender } from '@prisma/client';
import { assertSameOriginServerAction } from '@/lib/security/server-action-origin';
import { getCurrentUser } from '@/lib/auth/current-user';
import { prisma } from '@/lib/db/prisma';
import {
  dispatchMessageNotificationQueue,
  queueMessageNotifications
} from './notifications/message-notification-outbox';

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
        type: true,
        subject: true,
        status: true,
        userId: true,
        name: true,
        email: true,
        businessAccountId: true,
        user: {
          select: {
            email: true,
            profile: { select: { fullName: true } }
          }
        },
        businessAccount: {
          select: {
            companyName: true,
            owner: {
              select: {
                email: true,
                profile: { select: { fullName: true } }
              }
            }
          }
        },
        vacancy: {
          select: {
            title: true,
            createdById: true,
            businessAccountId: true,
            businessAccount: {
              select: {
                companyName: true,
                owner: {
                  select: {
                    email: true,
                    profile: { select: { fullName: true } }
                  }
                }
              }
            }
          }
        },
        supplier: {
          select: {
            title: true,
            businessAccountId: true,
            businessAccount: {
              select: {
                companyName: true,
                owner: {
                  select: {
                    email: true,
                    profile: { select: { fullName: true } }
                  }
                }
              }
            }
          }
        }
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

      await queueMessageNotifications(tx, buildMessageNotificationJobs({
        application,
        currentUser,
        senderRole: input.senderRole
      }));

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

type MessageNotificationApplication = {
  id: string;
  type: ApplicationType;
  subject: string | null;
  name: string | null;
  email: string | null;
  user: {
    email: string;
    profile: { fullName: string | null } | null;
  } | null;
  businessAccount: {
    companyName: string;
    owner: {
      email: string;
      profile: { fullName: string | null } | null;
    };
  } | null;
  vacancy: {
    title: string;
    businessAccount: {
      companyName: string;
      owner: {
        email: string;
        profile: { fullName: string | null } | null;
      };
    } | null;
  } | null;
  supplier: {
    title: string;
    businessAccount: {
      companyName: string;
      owner: {
        email: string;
        profile: { fullName: string | null } | null;
      };
    } | null;
  } | null;
};

function getDisplayName(user: {
  email?: string | null;
  profile?: { fullName: string | null } | null;
}) {
  return user.profile?.fullName ?? user.email ?? 'BARSYNERGY';
}

function getBusinessRecipient(application: MessageNotificationApplication) {
  const businessAccount = application.businessAccount ?? application.vacancy?.businessAccount ?? application.supplier?.businessAccount;
  const owner = businessAccount?.owner;

  if (!owner?.email) return null;

  return {
    email: owner.email,
    name: owner.profile?.fullName ?? businessAccount?.companyName ?? null
  };
}

function getUserRecipient(application: MessageNotificationApplication) {
  const email = application.user?.email ?? application.email;

  if (!email) return null;

  return {
    email,
    name: application.user?.profile?.fullName ?? application.name ?? null
  };
}

function getContextLabel(application: MessageNotificationApplication) {
  return application.vacancy?.title
    ?? application.supplier?.title
    ?? application.subject
    ?? 'Заявка';
}

function getUserThreadUrl(application: MessageNotificationApplication) {
  if (application.type === ApplicationType.SUPPLIER_INQUIRY) {
    return `/profile/inquiries/${application.id}`;
  }

  return `/profile/responses/${application.id}`;
}

function buildMessageNotificationJobs(input: {
  application: MessageNotificationApplication;
  currentUser: {
    email?: string | null;
    profile?: { fullName: string | null } | null;
  };
  senderRole: ConversationSender;
}) {
  const contextLabel = getContextLabel(input.application);
  const senderName = input.senderRole === ConversationSender.ADMIN
    ? 'BARSYNERGY'
    : getDisplayName(input.currentUser);
  const jobs: Parameters<typeof queueMessageNotifications>[1] = [];

  if (input.senderRole === ConversationSender.USER || input.senderRole === ConversationSender.ADMIN) {
    const recipient = getBusinessRecipient(input.application);
    if (recipient) {
      jobs.push({
        channel: ApplicationNotificationChannel.BUSINESS_MESSAGE_EMAIL,
        payload: {
          applicationId: input.application.id,
          senderRole: input.senderRole,
          recipientEmail: recipient.email,
          recipientName: recipient.name,
          senderName,
          contextLabel,
          threadUrl: `/business/cabinet/responses/${input.application.id}`
        }
      });
    }
  }

  if (input.senderRole === ConversationSender.BUSINESS || input.senderRole === ConversationSender.ADMIN) {
    const recipient = getUserRecipient(input.application);
    if (recipient) {
      jobs.push({
        channel: ApplicationNotificationChannel.USER_MESSAGE_EMAIL,
        payload: {
          applicationId: input.application.id,
          senderRole: input.senderRole,
          recipientEmail: recipient.email,
          recipientName: recipient.name,
          senderName,
          contextLabel,
          threadUrl: getUserThreadUrl(input.application)
        }
      });
    }
  }

  return jobs;
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
        OR: [
          { vacancy: { createdById: userId } },
          { vacancy: { businessAccount: { ownerId: userId } } },
          { businessAccount: { ownerId: userId } }
        ]
      },
      select: { id: true }
    });
    return owned !== null;
  }

  return false;
}
