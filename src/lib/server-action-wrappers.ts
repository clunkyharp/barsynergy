import { formatAdminActionError, redirectWithAdminActionResult, safeAdminRedirectPath } from '@/lib/admin/content-utils';
import { isRedirectError } from '@/lib/actions/server-action-errors';
import { requireAdminSectionAccess } from '@/lib/auth/require-admin-section';
import type { AdminSection } from '@/lib/auth/permissions';
import type { CurrentUser } from '@/lib/auth/current-user';
import { assertSameOriginServerAction } from '@/lib/security/server-action-origin';

type AdminActionResult = { type: 'success'; message: string } | { type: 'error'; message: string };

type AdminActionHandler = (opts: { formData: FormData; user: CurrentUser }) => Promise<AdminActionResult>;

type AdminActionOptions = {
  formData: FormData;
  section: AdminSection;
  defaultRedirectPath: string;
  handler: AdminActionHandler;
  cleanup?: () => Promise<unknown>;
};

export async function withAdminAction(opts: AdminActionOptions): Promise<never> {
  const redirectTo = safeAdminRedirectPath(opts.formData, opts.defaultRedirectPath);

  try {
    await assertSameOriginServerAction();
    const user = await requireAdminSectionAccess(opts.section);
    const result = await opts.handler({ formData: opts.formData, user });
    redirectWithAdminActionResult(redirectTo, result);
  } catch (error) {
    if (isRedirectError(error)) {
      throw error;
    }

    await opts.cleanup?.();
    redirectWithAdminActionResult(redirectTo, { type: 'error', message: formatAdminActionError(error) });
  }
}
