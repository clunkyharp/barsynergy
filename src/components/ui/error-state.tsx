export function ErrorState({ title = 'Не удалось загрузить данные' }: { title?: string }) {
  return (
    <div className="rounded-lg border border-[var(--danger)] bg-white p-6 text-sm text-[var(--danger)]">
      {title}
    </div>
  );
}
