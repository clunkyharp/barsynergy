type LoadingStateProps = {
  label?: string;
};

export function LoadingState({ label = 'Загрузка данных' }: LoadingStateProps) {
  return (
    <div
      aria-busy="true"
      className="rounded-lg border border-[var(--line)] bg-[var(--surface)] p-6"
      role="status"
    >
      <p className="text-sm font-semibold text-[var(--muted)]">{label}</p>
      <div className="mt-5 grid gap-3" aria-hidden="true">
        <div className="h-4 w-3/5 animate-pulse rounded-sm bg-[var(--surface-muted)]" />
        <div className="h-4 w-full animate-pulse rounded-sm bg-[var(--surface-muted)]" />
        <div className="h-4 w-4/5 animate-pulse rounded-sm bg-[var(--surface-muted)]" />
      </div>
    </div>
  );
}
