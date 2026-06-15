import { ApplicationStatus, ApplicationType, EmploymentType, JobSearchStatus } from '@prisma/client';

export const eventFormatOptions = [
  { value: 'offline', label: 'Офлайн' },
  { value: 'online', label: 'Онлайн' },
  { value: 'hybrid', label: 'Гибрид' }
] as const;

export const eventRegistrationModeOptions = [
  { value: 'not_required', label: 'Не требуется' },
  { value: 'open', label: 'Открыта' },
  { value: 'soon', label: 'Скоро' },
  { value: 'closed', label: 'Закрыта' },
  { value: 'external', label: 'Внешняя ссылка' }
] as const;

export const courseFormatOptions = [
  { value: 'intensive', label: 'Интенсив' },
  { value: 'online_lecture', label: 'Онлайн-лекция' },
  { value: 'corporate', label: 'Корпоративное обучение' },
  { value: 'program', label: 'Программа' }
] as const;

export const courseLevelOptions = [
  { value: 'beginner', label: 'Новичок' },
  { value: 'middle', label: 'Средний' },
  { value: 'pro', label: 'Профи' },
  { value: 'manager', label: 'Управляющий' }
] as const;

export const vacancyEmploymentTypeOptions = [
  { value: 'full_time', label: 'Полная занятость' },
  { value: 'part_time', label: 'Частичная занятость' },
  { value: 'shift', label: 'Сменный график' },
  { value: 'project', label: 'Проектная работа' },
  { value: 'internship', label: 'Стажировка' }
] as const;

export const vacancyExperienceOptions = [
  { value: 'no_experience', label: 'Без опыта' },
  { value: 'one_year', label: 'От 1 года' },
  { value: 'three_years', label: 'От 3 лет' },
  { value: 'manager', label: 'Управленческий опыт' }
] as const;

export const partnerTypeOptions = [
  { value: 'brand', label: 'Бренд' },
  { value: 'venue', label: 'Площадка' },
  { value: 'education', label: 'Образовательный партнёр' },
  { value: 'media', label: 'Информационный партнёр' },
  { value: 'supplier', label: 'Поставщик' },
  { value: 'sponsor', label: 'Спонсор' },
  { value: 'expert', label: 'Эксперт' }
] as const;

const legacyOptionLabels: Record<string, string> = {
  basic: 'Базовый',
  brand: 'Бренд',
  offline: 'Офлайн'
};

export function getOptionLabel(
  options: ReadonlyArray<{ value: string; label: string }>,
  currentValue?: string | null,
  fallback = 'Не указано'
) {
  const value = currentValue?.trim();

  if (!value) {
    return fallback;
  }

  return (
    options.find((option) => option.value === value)?.label ??
    legacyOptionLabels[value] ??
    value
  );
}

export const applicationTypeLabels: Record<ApplicationType, string> = {
  [ApplicationType.BUSINESS_ACCOUNT_REQUEST]: 'Заявка на бизнес-доступ',
  [ApplicationType.COURSE_APPLICATION]: 'Заявка на курс',
  [ApplicationType.EVENT_APPLICATION]: 'Заявка на событие',
  [ApplicationType.VACANCY_SUBMISSION]: 'Размещение вакансии',
  [ApplicationType.VACANCY_RESPONSE]: 'Отклик на вакансию',
  [ApplicationType.SUPPLIER_SUBMISSION]: 'Заявка поставщика',
  [ApplicationType.MASTER_INQUIRY]: 'Запрос мастеру',
  [ApplicationType.MASTER_SUBMISSION]: 'Заявка мастера',
  [ApplicationType.PARTNER_APPLICATION]: 'Партнёрская заявка',
  [ApplicationType.BUSINESS_SOLUTION]: 'Бизнес-решение',
  [ApplicationType.CONSULTING_REQUEST]: 'Консалтинг',
  [ApplicationType.CONTACT_MESSAGE]: 'Контактное сообщение',
  [ApplicationType.CORPORATE_TRAINING_APPLICATION]: 'Корпоративное обучение',
  [ApplicationType.CERTIFICATE_ORDER]: 'Заказ сертификата',
  [ApplicationType.SUPPLIER_INQUIRY]: 'Запрос поставщику',
  [ApplicationType.RESUME_INVITATION]: 'Приглашение по резюме'
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

export const jobSearchStatusLabels: Record<JobSearchStatus, string> = {
  [JobSearchStatus.ACTIVE]: 'Активно ищу',
  [JobSearchStatus.OPEN]: 'Открыт к предложениям',
  [JobSearchStatus.NOT_LOOKING]: 'Не ищу'
};

export const employmentTypeLabels: Record<EmploymentType, string> = {
  [EmploymentType.FULL_TIME]: 'Полная занятость',
  [EmploymentType.PART_TIME]: 'Частичная занятость',
  [EmploymentType.FREELANCE]: 'Фриланс',
  [EmploymentType.REMOTE]: 'Удалённая работа'
};

export const applicationStatusBadgeVariants: Record<ApplicationStatus, 'neutral' | 'success' | 'warning' | 'danger' | 'pending'> = {
  [ApplicationStatus.DRAFT]: 'neutral',
  [ApplicationStatus.NEW]: 'pending',
  [ApplicationStatus.IN_REVIEW]: 'warning',
  [ApplicationStatus.CONTACTED]: 'pending',
  [ApplicationStatus.FORWARDED_TO_EMPLOYER]: 'pending',
  [ApplicationStatus.PAYMENT_PENDING]: 'warning',
  [ApplicationStatus.PAID_MANUALLY]: 'success',
  [ApplicationStatus.APPROVED]: 'success',
  [ApplicationStatus.REJECTED]: 'danger',
  [ApplicationStatus.COMPLETED]: 'success',
  [ApplicationStatus.ARCHIVED]: 'neutral'
};
