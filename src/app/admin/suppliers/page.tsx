import { AdminPlaceholderPage } from '@/components/admin/admin-placeholder-page';
import { requireAdminSectionAccess } from '@/lib/auth/require-admin-section';

export default async function AdminSuppliersPage() {
  await requireAdminSectionAccess('suppliers');

  return <AdminPlaceholderPage title="Suppliers" description="Каталог поставщиков и verified-статусы." />;
}
