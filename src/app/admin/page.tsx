import { Card } from '@/components/ui/card';
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
      <div className="mt-8 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {modules.map((module) => (
          <Card key={module} className="p-5">
            <p className="font-semibold">{module}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}
