// Client-safe content status literals. Mirrors Prisma's ContentStatus enum
// values without importing @prisma/client into the client bundle.
export const CONTENT_STATUS = {
  DRAFT: 'DRAFT',
  REVIEW: 'REVIEW',
  PUBLISHED: 'PUBLISHED',
  ARCHIVED: 'ARCHIVED'
} as const;

export type ContentStatusValue = (typeof CONTENT_STATUS)[keyof typeof CONTENT_STATUS];
