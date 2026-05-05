import { ApplicationStatus, ApplicationType } from '@prisma/client';
import { hasErrorMessage, resolveServerActionError } from '../actions/server-action-errors';

export const applicationTypeValues = [
  ApplicationType.BUSINESS_ACCOUNT_REQUEST,
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
  ApplicationStatus.DRAFT,
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
  [ApplicationType.BUSINESS_ACCOUNT_REQUEST]: 'Заявка на бизнес-доступ',
  [ApplicationType.COURSE_APPLICATION]: 'Заявка на курс',
  [ApplicationType.EVENT_APPLICATION]: 'Заявка на событие',
  [ApplicationType.VACANCY_SUBMISSION]: 'Размещение вакансии',
  [ApplicationType.VACANCY_RESPONSE]: 'Отклик на вакансию',
  [ApplicationType.SUPPLIER_SUBMISSION]: 'Заявка поставщика',
  [ApplicationType.PARTNER_APPLICATION]: 'Партнёрская заявка',
  [ApplicationType.CONTACT_MESSAGE]: 'Контактное сообщение',
  [ApplicationType.CORPORATE_TRAINING_APPLICATION]: 'Корпоративное обучение',
  [ApplicationType.CERTIFICATE_ORDER]: 'Заказ сертификата'
};

export const applicationStatusLabels: Record<ApplicationStatus, string> = {
  [ApplicationStatus.DRAFT]: 'Черновик',
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
  'neutral' | 'success' | 'warning' | 'danger' | 'pending'
> = {
  [ApplicationStatus.DRAFT]: 'neutral',
  [ApplicationStatus.NEW]: 'pending',
  [ApplicationStatus.IN_REVIEW]: 'pending',
  [ApplicationStatus.CONTACTED]: 'neutral',
  [ApplicationStatus.FORWARDED_TO_EMPLOYER]: 'success',
  [ApplicationStatus.PAYMENT_PENDING]: 'pending',
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
  return resolveServerActionError({
    action: 'admin:applications',
    error,
    zodMessage: 'Проверьте обязательные поля и формат значений.',
    known: [
      {
        matches: (candidate) => hasErrorMessage(candidate, 'forwarding requires'),
        message: 'Передача работодателю доступна только для отклика на вакансию с зафиксированным согласием.'
      },
      {
        matches: (candidate) => hasErrorMessage(candidate, 'vacancy draft'),
        message: 'Черновик вакансии можно создать только из заявки на размещение вакансии с полными данными и согласием.'
      },
      {
        matches: (candidate) => hasErrorMessage(candidate, 'business access request is invalid'),
        message: 'Ссылка доступа доступна только для заявок на бизнес-подключение.'
      },
      {
        matches: (candidate) => hasErrorMessage(candidate, 'business access email is missing'),
        message: 'В заявке не указан email для подготовки доступа.'
      },
      {
        matches: (candidate) => hasErrorMessage(candidate, 'business access role conflict'),
        message: 'Этот email уже привязан к другому типу аккаунта. Проверьте заявку вручную.'
      },
      {
        matches: (candidate) => hasErrorMessage(candidate, 'business access already active'),
        message: 'Доступ для этого email уже активирован.'
      },
      {
        matches: (candidate) => hasErrorMessage(candidate, 'business access is blocked'),
        message: 'Для этого доступа установлен блок. Снимите блокировку перед новой активацией.'
      }
    ],
    fallbackMessage: 'Не удалось сохранить заявку. Проверьте данные и повторите попытку.'
  });
}
