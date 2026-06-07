import { ApplicationStatus, ApplicationType } from '@prisma/client';

const EDITABLE_BUSINESS_NOTES_STATUSES: readonly ApplicationStatus[] = [
  ApplicationStatus.DRAFT,
  ApplicationStatus.NEW,
  ApplicationStatus.IN_REVIEW,
  ApplicationStatus.CONTACTED,
  ApplicationStatus.APPROVED,
  ApplicationStatus.PAYMENT_PENDING,
  ApplicationStatus.PAID_MANUALLY,
  ApplicationStatus.FORWARDED_TO_EMPLOYER
];

type ApplicationTransitionRecord = {
  type: ApplicationType;
  status: ApplicationStatus;
  vacancyId: string | null;
  consentAcceptedAt: Date | null;
};

export function canForwardApplicationToEmployer(application: ApplicationTransitionRecord) {
  return (
    application.type === ApplicationType.VACANCY_RESPONSE &&
    Boolean(application.vacancyId) &&
    Boolean(application.consentAcceptedAt)
  );
}

export function getAvailableApplicationStatuses(
  application: ApplicationTransitionRecord,
  statusValues: readonly ApplicationStatus[]
) {
  return statusValues.filter(
    (status) =>
      status === application.status ||
      status !== ApplicationStatus.FORWARDED_TO_EMPLOYER ||
      canForwardApplicationToEmployer(application)
  );
}

export function canUpdateApplicationBusinessNotes(application: { businessAccountId: string | null; status: ApplicationStatus }) {
  return Boolean(application.businessAccountId) && EDITABLE_BUSINESS_NOTES_STATUSES.includes(application.status);
}

export function getApplicationStatusUpdate(input: {
  application: ApplicationTransitionRecord;
  nextStatus: ApplicationStatus;
  userId: string;
  now?: Date;
}) {
  if (input.nextStatus === input.application.status) {
    return {
      status: input.nextStatus
    };
  }

  if (input.nextStatus === ApplicationStatus.FORWARDED_TO_EMPLOYER) {
    if (!canForwardApplicationToEmployer(input.application)) {
      if (input.application.type !== ApplicationType.VACANCY_RESPONSE) {
        throw new Error('forwarding requires vacancy response application');
      }

      if (!input.application.vacancyId) {
        throw new Error('forwarding requires linked vacancy');
      }

      throw new Error('forwarding requires candidate consent');
    }

    return {
      status: input.nextStatus,
      forwardedAt: input.now ?? new Date(),
      forwardedById: input.userId
    };
  }

  if (input.application.status === ApplicationStatus.FORWARDED_TO_EMPLOYER) {
    return {
      status: input.nextStatus,
      forwardedAt: null,
      forwardedById: null
    };
  }

  return {
    status: input.nextStatus
  };
}
