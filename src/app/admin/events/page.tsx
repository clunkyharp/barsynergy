import { AdminPlaceholderPage } from '@/components/admin/admin-placeholder-page';
import { requireAdminSectionAccess } from '@/lib/auth/require-admin-section';

export default async function AdminEventsPage() {
  await requireAdminSectionAccess('events');

  return <AdminPlaceholderPage title="Events" description="Управление событиями и будущими заявками на участие." />;
}
