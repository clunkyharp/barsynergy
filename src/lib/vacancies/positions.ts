export const vacancyPositionValues = ['Бариста', 'Управляющий', 'Менеджер'] as const;

export type VacancyPosition = (typeof vacancyPositionValues)[number];

export function isVacancyPosition(value: string): value is VacancyPosition {
  return vacancyPositionValues.includes(value as VacancyPosition);
}
