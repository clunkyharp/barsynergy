export default function BusinessCabinetLoading() {
  return (
    <div aria-busy="true" aria-label="Загружаем кабинет" className="space-y-8">
      <div className="h-7 w-48 animate-pulse rounded-[var(--radius-sm)] bg-[var(--skeleton-fill)]" />
      <div className="grid gap-3 md:grid-cols-4">
        <div className="h-24 animate-pulse rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--surface-card)]" />
        <div className="h-24 animate-pulse rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--surface-card)]" />
        <div className="h-24 animate-pulse rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--surface-card)]" />
        <div className="h-24 animate-pulse rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--surface-card)]" />
      </div>
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.1fr)_minmax(300px,0.45fr)]">
        <div className="h-48 animate-pulse rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--surface-wash)]" />
        <div className="space-y-5">
          <div className="h-36 animate-pulse rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--surface-card)]" />
        </div>
      </div>
      <div className="h-32 animate-pulse rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--surface-card)]" />
    </div>
  );
}
