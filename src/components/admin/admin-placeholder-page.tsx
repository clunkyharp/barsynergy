import { EmptyState } from '@/components/ui/empty-state';

type AdminPlaceholderPageProps = {
  title: string;
};

export function AdminPlaceholderPage({ title }: AdminPlaceholderPageProps) {
  return (
    <div>
      <h1 className="text-3xl font-semibold">{title}</h1>
      <div className="mt-8">
        <EmptyState title="Записей пока нет" actionLabel="Вернуться в админку" actionHref="/admin" />
      </div>
    </div>
  );
}
