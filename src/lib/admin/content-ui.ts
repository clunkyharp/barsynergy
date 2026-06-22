import { CONTENT_STATUS, type ContentStatusValue } from '@/lib/admin/content-status';

export const contentStatusLabels: Record<ContentStatusValue, string> = {
  [CONTENT_STATUS.DRAFT]: 'Черновик',
  [CONTENT_STATUS.REVIEW]: 'На проверке',
  [CONTENT_STATUS.PUBLISHED]: 'Опубликовано',
  [CONTENT_STATUS.ARCHIVED]: 'Архив'
};

export const PUBLICATION_STATUS_HINT = 'Опубликовано видно на сайте. Черновик, на проверке и архив скрыты.';

export function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}
