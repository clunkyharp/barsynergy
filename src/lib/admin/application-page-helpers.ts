import { ApplicationStatus, ApplicationType } from '@prisma/client';
import { getApplicationPayloadText } from '@/lib/applications/application-payloads';

export const ADMIN_APPLICATIONS_PATH = '/admin/applications';

export const dateTimeFormatter = new Intl.DateTimeFormat('ru-RU', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit'
});

export const quickStatusFilters = [
  { label: 'Новые', status: ApplicationStatus.NEW },
  { label: 'На проверке', status: ApplicationStatus.IN_REVIEW },
  { label: 'Одобрены', status: ApplicationStatus.APPROVED },
  { label: 'Завершены', status: ApplicationStatus.COMPLETED }
] as const;

export type ApplicationPublicationTarget = 'master' | 'partner' | 'supplier' | 'vacancy';

type ApplicationActionInput = {
  type: ApplicationType;
  status: ApplicationStatus;
  vacancy: { title: string; slug: string } | null;
  supplier: { title: string; slug: string } | null;
  partner: { title: string; slug: string } | null;
  master: { title: string; slug: string } | null;
  resumeFileId: string | null;
  consentAcceptedAt: Date | null;
};

export function applicationActionLabel(application: ApplicationActionInput) {
  switch (application.status) {
    case ApplicationStatus.NEW: {
      if (application.type === ApplicationType.BUSINESS_ACCOUNT_REQUEST) return 'Проверить бизнес-заявку';
      if (application.type === ApplicationType.VACANCY_RESPONSE && application.resumeFileId) return 'Проверить отклик';
      return 'Назначить следующий статус';
    }
    case ApplicationStatus.IN_REVIEW:
      return 'Завершить проверку';
    case ApplicationStatus.PAYMENT_PENDING:
      return 'Проверить оплату';
    case ApplicationStatus.APPROVED: {
      if (application.type === ApplicationType.VACANCY_SUBMISSION && !application.vacancy) return 'Опубликовать вакансию';
      if (application.type === ApplicationType.SUPPLIER_SUBMISSION && !application.supplier) return 'Опубликовать поставщика';
      if (application.type === ApplicationType.PARTNER_APPLICATION && !application.partner) return 'Опубликовать партнёра';
      if (application.type === ApplicationType.MASTER_SUBMISSION && !application.master) return 'Опубликовать мастера';
      if (!application.consentAcceptedAt && application.type !== ApplicationType.CONTACT_MESSAGE) return 'Проверить согласие';
      return 'Контроль не требуется';
    }
    default: {
      if (!application.consentAcceptedAt && application.type !== ApplicationType.CONTACT_MESSAGE) return 'Проверить согласие';
      return 'Контроль не требуется';
    }
  }
}

export function applicationPublicationTarget(
  application: ApplicationActionInput & { type: ApplicationType }
): ApplicationPublicationTarget | null {
  if (application.status !== ApplicationStatus.APPROVED || !application.consentAcceptedAt) {
    return null;
  }

  switch (application.type) {
    case ApplicationType.VACANCY_SUBMISSION:
      return application.vacancy ? null : 'vacancy';
    case ApplicationType.SUPPLIER_SUBMISSION:
      return application.supplier ? null : 'supplier';
    case ApplicationType.PARTNER_APPLICATION:
      return application.partner ? null : 'partner';
    case ApplicationType.MASTER_SUBMISSION:
      return application.master ? null : 'master';
    default:
      return null;
  }
}

type ApplicationIdentityInput = {
  businessAccount: { companyName: string } | null;
  email: string | null;
  name: string | null;
  payload: unknown;
  phone: string | null;
  subject: string | null;
  telegram: string | null;
  type: ApplicationType;
};

export function applicationPersonOrCompany(application: ApplicationIdentityInput) {
  const companyName =
    application.businessAccount?.companyName ??
    getApplicationPayloadText(application.type, application.payload, ['projectName', 'companyName', 'employerCompanyName']);
  const primary = companyName ?? application.name?.trim() ?? application.subject?.trim() ?? application.email ?? 'Не указано';
  const secondary = [application.name && companyName ? application.name : null, application.email, application.phone, application.telegram]
    .filter(Boolean)
    .join(' / ');

  return { primary, secondary };
}
