import { ApplicationStatus, ApplicationType } from '@prisma/client';
import { ZodError } from 'zod';

export const applicationTypeValues = [
  ApplicationType.COURSE_APPLICATION,
  ApplicationType.EVENT_APPLICATION,
  ApplicationType.VACANCY_SUBMISSION,
  ApplicationType.VACANCY_RESPONSE,
  ApplicationType.SUPPLIER_SUBMISSION,
  ApplicationType.PARTNER_APPLICATION,
  ApplicationType.CONTACT_MESSAGE,
  ApplicationType.CORPORATE_TRAINING_APPLICATION,
  ApplicationType.CERTIFICATE_ORDER
] as const;

export const applicationStatusValues = [
  ApplicationStatus.NEW,
  ApplicationStatus.IN_REVIEW,
  ApplicationStatus.CONTACTED,
  ApplicationStatus.FORWARDED_TO_EMPLOYER,
  ApplicationStatus.PAYMENT_PENDING,
  ApplicationStatus.PAID_MANUALLY,
  ApplicationStatus.APPROVED,
  ApplicationStatus.REJECTED,
  ApplicationStatus.COMPLETED,
  ApplicationStatus.ARCHIVED
] as const;

export const applicationTypeLabels: Record<ApplicationType, string> = {
  [ApplicationType.COURSE_APPLICATION]: 'Заявка на курс',
  [ApplicationType.EVENT_APPLICATION]: 'Заявка на событие',
  [ApplicationType.VACANCY_SUBMISSION]: 'Размещение вакансии',
  [ApplicationType.VACANCY_RESPONSE]: 'Отклик на вакансию',
  [ApplicationType.SUPPLIER_SUBMISSION]: 'Заявка поставщика',
  [ApplicationType.PARTNER_APPLICATION]: 'Партнерская заявка',
  [ApplicationType.CONTACT_MESSAGE]: 'Контактное сообщение',
  [ApplicationType.CORPORATE_TRAINING_APPLICATION]: 'Корпоративное обучение',
  [ApplicationType.CERTIFICATE_ORDER]: 'Заказ сертификата'
};

export const applicationStatusLabels: Record<ApplicationStatus, string> = {
  [ApplicationStatus.NEW]: 'Новая',
  [ApplicationStatus.IN_REVIEW]: 'На проверке',
  [ApplicationStatus.CONTACTED]: 'Связались',
  [ApplicationStatus.FORWARDED_TO_EMPLOYER]: 'Передана работодателю',
  [ApplicationStatus.PAYMENT_PENDING]: 'Ожидает оплаты',
  [ApplicationStatus.PAID_MANUALLY]: 'Оплачена вручную',
  [ApplicationStatus.APPROVED]: 'Одобрена',
  [ApplicationStatus.REJECTED]: 'Отклонена',
  [ApplicationStatus.COMPLETED]: 'Завершена',
  [ApplicationStatus.ARCHIVED]: 'Архив'
};

export const applicationStatusBadgeVariants: Record<
  ApplicationStatus,
  'neutral' | 'success' | 'warning' | 'danger'
> = {
  [ApplicationStatus.NEW]: 'warning',
  [ApplicationStatus.IN_REVIEW]: 'warning',
  [ApplicationStatus.CONTACTED]: 'neutral',
  [ApplicationStatus.FORWARDED_TO_EMPLOYER]: 'success',
  [ApplicationStatus.PAYMENT_PENDING]: 'warning',
  [ApplicationStatus.PAID_MANUALLY]: 'success',
  [ApplicationStatus.APPROVED]: 'success',
  [ApplicationStatus.REJECTED]: 'danger',
  [ApplicationStatus.COMPLETED]: 'success',
  [ApplicationStatus.ARCHIVED]: 'neutral'
};

export function parseApplicationType(value?: string) {
  return applicationTypeValues.find((type) => type === value);
}

export function parseApplicationStatus(value?: string) {
  return applicationStatusValues.find((status) => status === value);
}

export function formatApplicationActionError(error: unknown) {
  if (error instanceof ZodError) {
    return 'Проверьте обязательные поля и формат значений.';
  }

  if (error instanceof Error && error.message.includes('forwarding requires')) {
    return 'Передача работодателю доступна только для отклика на вакансию с зафиксированным согласием.';
  }

  return 'Не удалось сохранить заявку. Проверьте данные и повторите попытку.';
}
