import { AdminPlaceholderPage } from '@/components/admin/admin-placeholder-page';
import { requireAdminSectionAccess } from '@/lib/auth/require-admin-section';

export default async function AdminUsersPage() {
  await requireAdminSectionAccess('users');

  return <AdminPlaceholderPage title="Users" description="Пользователи, роли и блокировки." />;
}
