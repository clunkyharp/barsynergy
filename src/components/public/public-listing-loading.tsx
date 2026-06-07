export function PublicListingLoading({ title }: { title: string }) {
  return (
    <section className="background-zone background-zone-ivory border-b border-[var(--line)] py-8 md:py-12" aria-busy="true" aria-label={`Загружаем: ${title}`}>
      <div className="container grid gap-6">
        <div className="grid gap-3">
          <div className="h-4 w-28 animate-pulse rounded-[var(--radius-sm)] bg-[var(--skeleton-fill)]" />
          <div className="h-10 w-56 max-w-full animate-pulse rounded-[var(--radius-sm)] bg-[var(--skeleton-fill)]" />
        </div>
        <div className="grid gap-5 xl:grid-cols-[minmax(16rem,0.48fr)_minmax(0,1.52fr)]">
          <div className="h-24 animate-pulse rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--surface-wash)]" />
          <div className="grid gap-3">
            <div className="h-20 animate-pulse rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--surface-card)]" />
            <div className="h-20 animate-pulse rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--surface-card)]" />
          </div>
        </div>
      </div>
    </section>
  );
}
