import { AdminPageIntro } from '@/components/admin/admin-page-intro';
import { EmptyState } from '@/components/ui/empty-state';

type AdminPlaceholderPageProps = {
  title: string;
};

export function AdminPlaceholderPage({ title }: AdminPlaceholderPageProps) {
  return (
    <div className="space-y-6">
      <AdminPageIntro eyebrow="Админка / Справочники" title={title} description="Раздел виден в структуре админки, но CRUD для него еще не подключен." />
      <div>
        <EmptyState
          title="Раздел в подготовке"
          description="Это не пустой каталог данных. Для этого раздела еще не включены просмотр, создание и редактирование записей."
          actionLabel="Вернуться в админку"
          actionHref="/admin"
        />
      </div>
    </div>
  );
}
