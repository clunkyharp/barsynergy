import { AdminPlaceholderPage } from '@/components/admin/admin-placeholder-page';
import { requireAdminSectionAccess } from '@/lib/auth/require-admin-section';

export default async function AdminCoursesPage() {
  await requireAdminSectionAccess('courses');

  return <AdminPlaceholderPage title="Courses" description="Управление образовательными программами." />;
}
