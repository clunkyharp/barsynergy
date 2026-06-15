export {
  ApplicationStatus,
  ApplicationType,
  BusinessAccountStatus,
  CategoryType,
  ContentStatus,
  ConversationSender,
  MasterEntityType,
  UserRole,
  UserStatus,
} from '@prisma/client';
export type { Prisma } from '@prisma/client';

// Note: raw prisma is no longer re-exported from this module.
// Admin pages should use query functions from @/lib/admin/admin-queries.ts.
