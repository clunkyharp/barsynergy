import { Card } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { requireAdminSectionAccess } from '@/lib/auth/require-admin-section';

const modules = [
  'Статьи',
  'События',
  'Курсы',
  'Вакансии',
  'Поставщики',
  'Партнеры',
  'Заявки',
  'Пользователи',
  'Категории',
  'Города',
  'Теги'
];

export default async function AdminPage() {
  await requireAdminSectionAccess('dashboard');

  return (
    <div>
      <h1 className="text-3xl font-semibold">Админка</h1>
      <p className="mt-2 max-w-2xl text-[var(--muted)]">
        Контентные разделы подключены во второй фазе. Очередь заявок подготовлена как первый срез третьей фазы.
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
          title="Рабочие разделы подключаются по фазам"
          description="Контент уже управляется через админку, заявки пока доступны как пустая очередь до подключения публичных форм."
          actionLabel="Перейти к разделам"
          actionHref="/admin/articles"
        />
      </div>
    </div>
  );
}
