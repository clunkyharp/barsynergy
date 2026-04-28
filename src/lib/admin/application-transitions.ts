import { ApplicationStatus, ApplicationType } from '@prisma/client';

type ApplicationTransitionRecord = {
  type: ApplicationType;
  status: ApplicationStatus;
  vacancyId: string | null;
  consentAcceptedAt: Date | null;
};

export function getApplicationStatusUpdate(input: {
  application: ApplicationTransitionRecord;
  nextStatus: ApplicationStatus;
  userId: string;
  now?: Date;
}) {
  if (input.nextStatus === ApplicationStatus.FORWARDED_TO_EMPLOYER) {
    if (input.application.type !== ApplicationType.VACANCY_RESPONSE) {
      throw new Error('forwarding requires vacancy response application');
    }

    if (!input.application.vacancyId) {
      throw new Error('forwarding requires linked vacancy');
    }

    if (!input.application.consentAcceptedAt) {
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
