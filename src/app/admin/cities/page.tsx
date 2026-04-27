import { AdminPlaceholderPage } from '@/components/admin/admin-placeholder-page';
import { requireAdminSectionAccess } from '@/lib/auth/require-admin-section';

export default async function AdminCitiesPage() {
  await requireAdminSectionAccess('cities');

  return <AdminPlaceholderPage title="Cities" description="Города и региональная навигация." />;
}
