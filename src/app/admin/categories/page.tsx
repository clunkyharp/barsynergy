import { AdminPlaceholderPage } from '@/components/admin/admin-placeholder-page';
import { requireAdminSectionAccess } from '@/lib/auth/require-admin-section';

export const dynamic = 'force-dynamic';

export default async function AdminCategoriesPage() {
  await requireAdminSectionAccess('categories');

  return <AdminPlaceholderPage title="Категории" />;
}
