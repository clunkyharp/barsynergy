import { AdminPlaceholderPage } from '@/components/admin/admin-placeholder-page';
import { requireAdminSectionAccess } from '@/lib/auth/require-admin-section';

export default async function AdminCategoriesPage() {
  await requireAdminSectionAccess('categories');

  return <AdminPlaceholderPage title="Categories" description="Категории для статей, событий, курсов и каталогов." />;
}
