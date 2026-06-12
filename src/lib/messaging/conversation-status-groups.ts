import { ApplicationStatus, type Prisma } from '@prisma/client';

export type ConversationStatusGroup = 'active' | 'closed' | 'archive';

export const conversationStatusGroups: ConversationStatusGroup[] = ['active', 'closed', 'archive'];

const activeStatuses: ApplicationStatus[] = [
  ApplicationStatus.NEW,
  ApplicationStatus.IN_REVIEW,
  ApplicationStatus.CONTACTED,
  ApplicationStatus.FORWARDED_TO_EMPLOYER,
  ApplicationStatus.PAYMENT_PENDING,
  ApplicationStatus.PAID_MANUALLY,
  ApplicationStatus.APPROVED
];

const closedStatuses: ApplicationStatus[] = [
  ApplicationStatus.REJECTED,
  ApplicationStatus.COMPLETED
];

export function parseConversationStatusGroup(value?: string): ConversationStatusGroup {
  return value && conversationStatusGroups.includes(value as ConversationStatusGroup)
    ? value as ConversationStatusGroup
    : 'active';
}

export function getConversationStatusFilter(
  group: ConversationStatusGroup,
  options: { includeDraft?: boolean } = {}
): Prisma.EnumApplicationStatusFilter {
  if (group === 'archive') {
    return { in: [ApplicationStatus.ARCHIVED] };
  }

  if (group === 'closed') {
    return { in: closedStatuses };
  }

  return {
    in: options.includeDraft
      ? [ApplicationStatus.DRAFT, ...activeStatuses]
      : activeStatuses
  };
}
