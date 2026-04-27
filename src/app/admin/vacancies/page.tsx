import { AdminPlaceholderPage } from '@/components/admin/admin-placeholder-page';
import { requireAdminSectionAccess } from '@/lib/auth/require-admin-section';

export default async function AdminVacanciesPage() {
  await requireAdminSectionAccess('vacancies');

  return <AdminPlaceholderPage title="Vacancies" description="Модерация и публикация вакансий." />;
}
