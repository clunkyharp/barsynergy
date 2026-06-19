export default function ProfileLoading() {
  return (
    <div aria-busy="true" aria-label="Загружаем профиль" className="space-y-6">
      <div className="h-7 w-32 animate-pulse rounded-[var(--radius-sm)] bg-[var(--skeleton-fill)]" />
      <div className="h-28 animate-pulse rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--surface-wash)]" />
      <div className="grid gap-3 md:grid-cols-3">
        <div className="h-28 animate-pulse rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--surface-card)]" />
        <div className="h-28 animate-pulse rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--surface-card)]" />
        <div className="h-28 animate-pulse rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--surface-card)]" />
      </div>
      <div className="h-24 animate-pulse rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--surface-wash)]" />
      <div className="h-32 animate-pulse rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--surface-card)]" />
    </div>
  );
}
