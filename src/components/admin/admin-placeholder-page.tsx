import { EmptyState } from '@/components/ui/empty-state';

type AdminPlaceholderPageProps = {
  title: string;
  description: string;
};

export function AdminPlaceholderPage({ title, description }: AdminPlaceholderPageProps) {
  return (
    <div>
      <h1 className="text-3xl font-semibold">{title}</h1>
      <p className="mt-2 max-w-2xl text-[var(--muted)]">{description}</p>
      <div className="mt-8">
        <EmptyState
          title="Раздел пока без данных"
          description="Интерфейс раздела подготовлен, подключение данных будет выполнено в следующем этапе."
          actionLabel="Вернуться в админку"
          actionHref="/admin"
        />
      </div>
    </div>
  );
}
