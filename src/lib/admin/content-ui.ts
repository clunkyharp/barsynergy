import { ContentStatus } from '@prisma/client';

export const contentStatusLabels: Record<ContentStatus, string> = {
  [ContentStatus.DRAFT]: 'Черновик',
  [ContentStatus.REVIEW]: 'На проверке',
  [ContentStatus.PUBLISHED]: 'Опубликовано',
  [ContentStatus.ARCHIVED]: 'Архив'
};

export const PUBLICATION_STATUS_HINT = 'Опубликовано видно на сайте. Черновик, на проверке и архив скрыты.';

export function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}
