import { AdminPageIntro } from '@/components/admin/admin-page-intro';
import { EmptyState } from '@/components/ui/empty-state';

type AdminPlaceholderPageProps = {
  title: string;
};

export function AdminPlaceholderPage({ title }: AdminPlaceholderPageProps) {
  return (
    <div className="space-y-6">
      <AdminPageIntro eyebrow="Админка / Справочники" title={title} description="Раздел уже есть в админке, но просмотр и редактирование ещё не подключены." />
      <div>
        <EmptyState
          title="Раздел в подготовке"
          description="Просмотр, создание и редактирование для этого раздела появятся позже."
          actionLabel="Вернуться в админку"
          actionHref="/admin"
        />
      </div>
    </div>
  );
}
