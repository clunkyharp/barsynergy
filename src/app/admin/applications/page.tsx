import { AdminPlaceholderPage } from '@/components/admin/admin-placeholder-page';
import { requireAdminSectionAccess } from '@/lib/auth/require-admin-section';

export default async function AdminApplicationsPage() {
  await requireAdminSectionAccess('applications');

  return <AdminPlaceholderPage title="Applications" description="Единый список заявок и статусы обработки." />;
}
