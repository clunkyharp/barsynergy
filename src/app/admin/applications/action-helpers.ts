import {
  formatApplicationActionError
} from '@/lib/admin/application-utils';
import {
  getString,
  redirectWithAdminActionResult,
  safeAdminRedirectPath
} from '@/lib/admin/content-utils';

export const ADMIN_APPLICATIONS_PATH = '/admin/applications';

export type AdminApplicationActionResult = { type: 'success' | 'error'; message: string };

export function applicationDetailPath(applicationId: string) {
  return `${ADMIN_APPLICATIONS_PATH}/${applicationId}`;
}

export function getApplicationActionRedirect(formData: FormData) {
  const fallbackPath = applicationDetailPath(getString(formData, 'applicationId'));
  return safeAdminRedirectPath(formData, fallbackPath);
}

export function getApplicationActionErrorResult(error: unknown): AdminApplicationActionResult {
  return { type: 'error', message: formatApplicationActionError(error) };
}

export function redirectWithApplicationActionResult(path: string, result: AdminApplicationActionResult) {
  redirectWithAdminActionResult(path, result);
}
