import { AdminPlaceholderPage } from '@/components/admin/admin-placeholder-page';
import { requireAdminSectionAccess } from '@/lib/auth/require-admin-section';

export default async function AdminPartnersPage() {
  await requireAdminSectionAccess('partners');

  return <AdminPlaceholderPage title="Partners" description="Партнеры, порядок отображения и публикация." />;
}
