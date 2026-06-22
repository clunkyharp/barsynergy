/**
 * @deprecated Re-export shim. content-utils was split into single-concern owners
 * (A-04). Import directly from the owners below; this file is removed once all
 * importers are migrated.
 *
 *   generic form data .......... @/lib/forms/form-data
 *   admin search params ........ @/lib/admin/content-search-params
 *   redirect / error format .... @/lib/admin/content-redirect
 *   slug helpers ............... @/lib/admin/content-slug
 *   relation guards ............ @/lib/admin/content-relations
 *   publication dates .......... @/lib/admin/content-dates
 *   content image uploads ...... @/lib/admin/content-uploads
 */

export { firstParam, PUBLICATION_STATUS_HINT, contentStatusLabels } from '@/lib/admin/content-ui';
export {
  courseFormatOptions,
  courseLevelOptions,
  eventFormatOptions,
  eventRegistrationModeOptions,
  getAdminOptionLabel,
  partnerTypeOptions,
  vacancyEmploymentTypeOptions,
  vacancyExperienceOptions
} from '@/lib/admin/content-labels';

export { getString, optionalString, getArray, nullableString } from '@/lib/forms/form-data';
export {
  type AdminContentSearchParams,
  ADMIN_CONTENT_PAGE_SIZE,
  contentStatusValues,
  contentStatusBadgeVariants,
  getAdminPage,
  getAdminSearchQuery,
  getAdminStatusFilter,
  getAdminStringFilter,
  getAdminBooleanFilter,
  withCurrentValueOption,
  getAdminTotalPages,
  getAdminCurrentPath
} from '@/lib/admin/content-search-params';
export {
  safeAdminRedirectPath,
  adminActionResultPath,
  redirectWithAdminActionResult,
  formatAdminActionError
} from '@/lib/admin/content-redirect';
export { slugify, findUniqueSlug, persistWithUniqueSlugRetry } from '@/lib/admin/content-slug';
export { assertActiveContentRelations } from '@/lib/admin/content-relations';
export { initialPublicationDates, statusTransitionDates } from '@/lib/admin/content-dates';
export {
  uploadPublicContentImageFromFormData,
  resolveCoverImageId,
  deleteUploadedFileIfUnused
} from '@/lib/admin/content-uploads';
