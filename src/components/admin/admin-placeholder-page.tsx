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
        <EmptyState title="CRUD еще не реализован" description="Этот раздел подготовлен для следующих фаз MVP." />
      </div>
    </div>
  );
}
