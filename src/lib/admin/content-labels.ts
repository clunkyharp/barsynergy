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

const adminLegacyOptionLabels: Record<string, string> = {
  basic: 'Базовый',
  brand: 'Бренд',
  offline: 'Офлайн'
};

export function getAdminOptionLabel(
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
    adminLegacyOptionLabels[value] ??
    value
  );
}
