type ErrorStateProps = {
  title?: string;
  description?: string;
};

export function ErrorState({
  title = 'Не удалось загрузить данные',
  description = 'Обновите страницу или повторите действие позже.'
}: ErrorStateProps) {
  return (
    <div className="rounded-lg border border-[var(--danger)] bg-white p-6" role="alert">
      <p className="text-sm font-semibold text-[var(--danger)]">{title}</p>
      <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{description}</p>
    </div>
  );
}
