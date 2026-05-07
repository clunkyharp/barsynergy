type ErrorStateProps = {
  title?: string;
  description?: string;
};

export function ErrorState({
  title = 'Не удалось загрузить данные',
  description = 'Обновите страницу или повторите действие позже.'
}: ErrorStateProps) {
  return (
    <div className="rounded-[var(--radius-md)] border border-[var(--danger-border)] border-l-[3px] border-l-[var(--danger)] bg-[var(--danger-bg)] p-5" role="alert">
      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--danger)]">Ошибка</p>
      <p className="mt-2 text-sm font-semibold text-[var(--danger-text)]">{title}</p>
      <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{description}</p>
    </div>
  );
}
