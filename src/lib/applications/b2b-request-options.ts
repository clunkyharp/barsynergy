export const businessSolutionTypeOptions = [
  {
    value: 'venue_site',
    label: 'Сайт для заведения',
    description: 'Страница или небольшой сайт с меню, событиями, контактами и заявками.',
    actionLabel: 'Обсудить сайт'
  },
  {
    value: 'request_bot',
    label: 'Telegram-бот для заявок',
    description: 'Сбор заявок, вопросов или записей без внешних форм.',
    actionLabel: 'Собрать бот'
  },
  {
    value: 'vacancy_bot',
    label: 'Бот для вакансий',
    description: 'Приём откликов, первичные вопросы и передача кандидатов команде.',
    actionLabel: 'Настроить отклики'
  },
  {
    value: 'internal_mini_system',
    label: 'Внутренняя мини-система',
    description: 'Простая рабочая панель для заявок, задач, списков или статусов.',
    actionLabel: 'Описать процесс'
  },
  {
    value: 'notifications_automation',
    label: 'Автоматизация уведомлений',
    description: 'Уведомления о заявках, сменах, задачах или важных изменениях.',
    actionLabel: 'Настроить уведомления'
  }
] as const;

export const consultingDirectionOptions = [
  { value: 'venue_opening', label: 'Открытие заведения' },
  { value: 'bar_menu', label: 'Барная карта' },
  { value: 'team_training', label: 'Обучение команды' },
  { value: 'cost_pricing', label: 'Себестоимость и цены' },
  { value: 'suppliers_procurement', label: 'Поставщики и закупки' },
  { value: 'operational_audit', label: 'Операционный аудит' }
] as const;

export const consultingBusinessTypeOptions = [
  { value: 'bar', label: 'Бар' },
  { value: 'cafe', label: 'Кафе' },
  { value: 'restaurant', label: 'Ресторан' },
  { value: 'coffee_shop', label: 'Кофейня' },
  { value: 'hotel_or_event', label: 'Отель или event-площадка' },
  { value: 'other', label: 'Другой формат' }
] as const;

export const consultingProjectStageOptions = [
  { value: 'idea', label: 'Идея или подготовка' },
  { value: 'opening', label: 'Запуск' },
  { value: 'working', label: 'Работающее заведение' },
  { value: 'restart', label: 'Перезапуск или смена формата' }
] as const;

export const consultingExpertOptions = [
  { value: 'opening_advisor', label: 'Эксперт по запуску' },
  { value: 'bar_menu_advisor', label: 'Эксперт по барной карте' },
  { value: 'training_advisor', label: 'Эксперт по обучению команды' },
  { value: 'economics_advisor', label: 'Эксперт по экономике' }
] as const;

export function getOptionLabel<T extends readonly { value: string; label: string }[]>(options: T, value?: string | null) {
  if (!value) {
    return null;
  }

  return options.find((option) => option.value === value)?.label ?? value;
}
