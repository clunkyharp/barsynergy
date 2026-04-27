import { Card } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { requireAdminSectionAccess } from '@/lib/auth/require-admin-section';

const modules = [
  'Articles',
  'Events',
  'Courses',
  'Vacancies',
  'Suppliers',
  'Partners',
  'Applications',
  'Users',
  'Categories',
  'Cities',
  'Tags'
];

export default async function AdminPage() {
  await requireAdminSectionAccess('dashboard');

  return (
    <div>
      <h1 className="text-3xl font-semibold">Админка</h1>
      <p className="mt-2 max-w-2xl text-[var(--muted)]">
        Phase 0 содержит только shell. CRUD, роли и защита страниц добавляются в следующих фазах.
      </p>
      <div className="mt-8 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {modules.map((module) => (
          <Card key={module} className="p-5">
            <p className="font-semibold">{module}</p>
            <p className="mt-2 text-sm text-[var(--muted)]">Раздел подготовлен для будущего CRUD.</p>
          </Card>
        ))}
      </div>
      <div className="mt-8">
        <EmptyState
          title="Данные еще не подключены"
          description="Модели контента и заявки появятся в Phase 2 и Phase 3."
          actionLabel="Перейти к разделам"
          actionHref="/admin/articles"
        />
      </div>
    </div>
  );
}
