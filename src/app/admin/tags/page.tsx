import { AdminPlaceholderPage } from '@/components/admin/admin-placeholder-page';
import { requireAdminSectionAccess } from '@/lib/auth/require-admin-section';

export default async function AdminTagsPage() {
  await requireAdminSectionAccess('tags');

  return <AdminPlaceholderPage title="Теги" />;
}
