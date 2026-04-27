import { AdminPlaceholderPage } from '@/components/admin/admin-placeholder-page';
import { requireAdminSectionAccess } from '@/lib/auth/require-admin-section';

export default async function AdminArticlesPage() {
  await requireAdminSectionAccess('articles');

  return <AdminPlaceholderPage title="Articles" description="Создание, редактирование и публикация материалов." />;
}
