export function LoadingState({ label = 'Загрузка' }: { label?: string }) {
  return (
    <div className="rounded-lg border border-[var(--line)] bg-[var(--surface)] p-6 text-sm text-[var(--muted)]">
      {label}...
    </div>
  );
}
