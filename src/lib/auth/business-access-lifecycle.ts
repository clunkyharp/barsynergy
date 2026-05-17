import { ApplicationStatus, ApplicationType, BusinessAccountStatus, UserStatus } from '@prisma/client';

const BUSINESS_ACCESS_INVITE_PREPARATION_STATUSES: ReadonlySet<ApplicationStatus> = new Set([
  ApplicationStatus.NEW,
  ApplicationStatus.IN_REVIEW,
  ApplicationStatus.CONTACTED,
  ApplicationStatus.APPROVED
]);

export function isBusinessAccessInviteActivationEligible({
  applicationStatus,
  userStatus,
  businessAccountStatus
}: {
  applicationStatus: ApplicationStatus;
  userStatus: UserStatus;
  businessAccountStatus: BusinessAccountStatus;
}) {
  return (
    applicationStatus === ApplicationStatus.APPROVED &&
    userStatus === UserStatus.PENDING &&
    businessAccountStatus === BusinessAccountStatus.PENDING
  );
}

export function isBusinessAccessInvitePreparationStatusAllowed(status: ApplicationStatus) {
  return BUSINESS_ACCESS_INVITE_PREPARATION_STATUSES.has(status);
}

export function shouldInvalidateBusinessAccessInvitesOnStatusChange({
  applicationType,
  previousStatus,
  nextStatus
}: {
  applicationType: ApplicationType;
  previousStatus: ApplicationStatus;
  nextStatus: ApplicationStatus;
}) {
  return (
    applicationType === ApplicationType.BUSINESS_ACCOUNT_REQUEST &&
    previousStatus === ApplicationStatus.APPROVED &&
    nextStatus !== ApplicationStatus.APPROVED
  );
}
