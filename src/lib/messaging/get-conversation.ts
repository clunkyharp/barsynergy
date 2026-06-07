import { ConversationSender, type Prisma } from '@prisma/client';
import { prisma } from '@/lib/db/prisma';

const MESSAGES_PAGE_SIZE = 50;

export type ConversationThreadMessage = {
  id: string;
  senderRole: ConversationSender;
  authorId: string | null;
  authorName: string | null;
  body: string;
  isReadByUser: boolean;
  isReadByBusiness: boolean;
  createdAt: Date;
};

export type ConversationContext = {
  applicationId: string;
  applicationType: string;
  applicationStatus: string;
  vacancyTitle: string | null;
  supplierTitle: string | null;
  candidateName: string | null;
  businessName: string | null;
  userId: string | null;
  businessAccountId: string | null;
  lastMessageAt: Date | null;
  messageCount: number;
};

export async function getConversationThread(
  applicationId: string,
  options?: { before?: Date; limit?: number }
): Promise<ConversationThreadMessage[]> {
  const limit = options?.limit ?? MESSAGES_PAGE_SIZE;

  const messages = await prisma.conversationMessage.findMany({
    where: {
      applicationId,
      ...(options?.before ? { createdAt: { lt: options.before } } : {})
    },
    orderBy: { createdAt: 'asc' },
    take: limit,
    select: {
      id: true,
      senderRole: true,
      authorId: true,
      body: true,
      isReadByUser: true,
      isReadByBusiness: true,
      createdAt: true,
      author: { select: { profile: { select: { fullName: true } } } }
    }
  });

  return messages.map((m) => ({
    id: m.id,
    senderRole: m.senderRole,
    authorId: m.authorId,
    authorName: m.author?.profile?.fullName ?? null,
    body: m.body,
    isReadByUser: m.isReadByUser,
    isReadByBusiness: m.isReadByBusiness,
    createdAt: m.createdAt
  }));
}

export async function getConversationContext(
  applicationId: string
): Promise<ConversationContext | null> {
  const application = await prisma.application.findUnique({
    where: { id: applicationId },
    select: {
      id: true,
      type: true,
      status: true,
      name: true,
      userId: true,
      businessAccountId: true,
      lastMessageAt: true,
      vacancy: { select: { title: true } },
      supplier: { select: { title: true } },
      businessAccount: { select: { companyName: true } },
      _count: { select: { conversationMessages: true } }
    }
  });

  if (!application) return null;

  return {
    applicationId: application.id,
    applicationType: application.type,
    applicationStatus: application.status,
    vacancyTitle: application.vacancy?.title ?? null,
    supplierTitle: application.supplier?.title ?? null,
    candidateName: application.name,
    businessName: application.businessAccount?.companyName ?? null,
    userId: application.userId,
    businessAccountId: application.businessAccountId,
    lastMessageAt: application.lastMessageAt,
    messageCount: application._count.conversationMessages
  };
}

export async function getUnreadMessageCounts(
  applicationIds: string[],
  role: 'user' | 'business'
): Promise<Map<string, number>> {
  if (applicationIds.length === 0) return new Map();

  const where: Prisma.ConversationMessageWhereInput = {
    applicationId: { in: applicationIds },
    ...(role === 'user'
      ? { isReadByUser: false, senderRole: { not: ConversationSender.USER } }
      : { isReadByBusiness: false, senderRole: { not: ConversationSender.BUSINESS } })
  };

  const groups = await prisma.conversationMessage.groupBy({
    by: ['applicationId'],
    where,
    _count: { id: true }
  });

  const map = new Map<string, number>();
  for (const g of groups) {
    map.set(g.applicationId, g._count.id);
  }
  return map;
}
