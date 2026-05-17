import { ApplicationStatus, ApplicationType } from '@prisma/client';
import { hasErrorMessage, resolveServerActionError } from '../actions/server-action-errors';
import {
  courseFormatOptions,
  courseLevelOptions,
  eventFormatOptions,
  eventRegistrationModeOptions,
  getAdminOptionLabel,
  partnerTypeOptions,
  vacancyEmploymentTypeOptions,
  vacancyExperienceOptions
} from '@/lib/admin/content-labels';
import {
  businessSolutionTypeOptions,
  consultingBusinessTypeOptions,
  consultingDirectionOptions,
  consultingExpertOptions,
  consultingProjectStageOptions,
  getOptionLabel
} from '@/lib/applications/b2b-request-options';

export const applicationTypeValues = [
  ApplicationType.BUSINESS_ACCOUNT_REQUEST,
  ApplicationType.COURSE_APPLICATION,
  ApplicationType.EVENT_APPLICATION,
  ApplicationType.VACANCY_SUBMISSION,
  ApplicationType.VACANCY_RESPONSE,
  ApplicationType.SUPPLIER_SUBMISSION,
  ApplicationType.PARTNER_APPLICATION,
  ApplicationType.BUSINESS_SOLUTION,
  ApplicationType.CONSULTING_REQUEST,
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
  [ApplicationType.BUSINESS_SOLUTION]: 'Бизнес-решение',
  [ApplicationType.CONSULTING_REQUEST]: 'Консалтинг',
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

export const applicationPayloadFieldLabels: Record<string, string> = {
  amountLabel: 'Сумма / формат',
  companyName: 'Компания',
  businessType: 'Тип бизнеса',
  businessTypeLabel: 'Тип бизнеса',
  comment: 'Комментарий',
  consultingDirection: 'Направление консалтинга',
  consultingDirectionLabel: 'Направление консалтинга',
  preferredExpert: 'Предпочтительный эксперт',
  preferredExpertLabel: 'Предпочтительный эксперт',
  details: 'Описание',
  employerCompanyName: 'Компания',
  employmentType: 'Тип занятости',
  eventDate: 'Дата события',
  experienceLabel: 'Опыт',
  format: 'Формат',
  formatLabel: 'Формат',
  level: 'Уровень',
  partnerType: 'Тип партнёрства',
  position: 'Позиция',
  projectName: 'Проект / заведение',
  projectStage: 'Стадия проекта',
  projectStageLabel: 'Стадия проекта',
  recipientName: 'Получатель',
  registrationMode: 'Регистрация',
  registrationUrl: 'Ссылка регистрации',
  resumeUrl: 'Ссылка на резюме',
  roleSummary: 'Кратко о кандидате',
  salaryLabel: 'Оплата',
  serviceArea: 'География работы',
  shortDescription: 'Краткое описание',
  solutionType: 'Тип решения',
  solutionTypeLabel: 'Тип решения',
  source: 'Источник',
  taskDescription: 'Описание задачи',
  teamSize: 'Размер команды',
  title: 'Название',
  websiteUrl: 'Сайт'
};

const applicationPayloadValueLabels: Record<string, Record<string, string>> = {
  source: {
    business_cabinet: 'Бизнес-кабинет',
    public_form: 'Публичная форма'
  }
};

export function getApplicationPayloadFieldLabel(key: string) {
  return applicationPayloadFieldLabels[key] ?? key;
}

export function formatApplicationPayloadValue(key: string, value: unknown) {
  if (typeof value === 'boolean') {
    return value ? 'Да' : 'Нет';
  }

  if (typeof value === 'number') {
    return String(value);
  }

  if (typeof value !== 'string') {
    return JSON.stringify(value);
  }

  const normalizedValue = value.trim();

  if (!normalizedValue) {
    return '';
  }

  const directLabel = applicationPayloadValueLabels[key]?.[normalizedValue];

  if (directLabel) {
    return directLabel;
  }

  if (key === 'employmentType') {
    return getAdminOptionLabel(vacancyEmploymentTypeOptions, normalizedValue, normalizedValue);
  }

  if (key === 'experienceLabel') {
    return getAdminOptionLabel(vacancyExperienceOptions, normalizedValue, normalizedValue);
  }

  if (key === 'partnerType') {
    return getAdminOptionLabel(partnerTypeOptions, normalizedValue, normalizedValue);
  }

  if (key === 'solutionType') {
    return getOptionLabel(businessSolutionTypeOptions, normalizedValue) ?? normalizedValue;
  }

  if (key === 'businessType') {
    return getOptionLabel(consultingBusinessTypeOptions, normalizedValue) ?? normalizedValue;
  }

  if (key === 'projectStage') {
    return getOptionLabel(consultingProjectStageOptions, normalizedValue) ?? normalizedValue;
  }

  if (key === 'consultingDirection') {
    return getOptionLabel(consultingDirectionOptions, normalizedValue) ?? normalizedValue;
  }

  if (key === 'preferredExpert') {
    return getOptionLabel(consultingExpertOptions, normalizedValue) ?? normalizedValue;
  }

  if (key === 'registrationMode') {
    return getAdminOptionLabel(eventRegistrationModeOptions, normalizedValue, normalizedValue);
  }

  if (key === 'level') {
    return getAdminOptionLabel(courseLevelOptions, normalizedValue, normalizedValue);
  }

  if (key === 'format' || key === 'formatLabel') {
    return getAdminOptionLabel([...eventFormatOptions, ...courseFormatOptions], normalizedValue, normalizedValue);
  }

  return normalizedValue;
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
        matches: (candidate) => hasErrorMessage(candidate, 'publication already exists'),
        message: 'Публичная запись уже связана с этой заявкой.'
      },
      {
        matches: (candidate) => hasErrorMessage(candidate, 'publication requires review status'),
        message: 'Опубликовать можно только новую, проверяемую, согласованную или одобренную заявку.'
      },
      {
        matches: (candidate) => hasErrorMessage(candidate, 'publication requires consent'),
        message: 'Для публикации нужна заявка с зафиксированным согласием.'
      },
      {
        matches: (candidate) => hasErrorMessage(candidate, 'publication requires'),
        message: 'Для публикации не хватает данных в заявке.'
      },
      {
        matches: (candidate) => hasErrorMessage(candidate, 'External URL must use http or https'),
        message: 'В заявке указан некорректный сайт. Исправьте адрес перед публикацией.'
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
      },
      {
        matches: (candidate) => hasErrorMessage(candidate, 'business access is archived'),
        message: 'Связанный бизнес-доступ в архиве. Проверьте заявку вручную перед новой активацией.'
      }
    ],
    fallbackMessage: 'Не удалось сохранить заявку. Проверьте данные и повторите попытку.'
  });
}
