export function DateBlock({ date }: { date: string }) {
  const value = new Date(date);
  const isValid = Number.isFinite(value.getTime());
  const day = isValid ? value.toLocaleDateString('ru-RU', { day: '2-digit' }) : date;
  const month = isValid ? value.toLocaleDateString('ru-RU', { month: 'short' }).replace('.', '') : '';
  const weekday = isValid ? value.toLocaleDateString('ru-RU', { weekday: 'short' }).replace('.', '') : '';

  return (
    <div className="flex w-16 flex-col self-start rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--surface-wash)] p-2.5 text-left md:justify-center md:text-center">
      <span className="block text-[9px] font-semibold uppercase tracking-[var(--tracking-eyebrow-md)] text-[var(--muted)]">{weekday}</span>
      <span className="mt-1 block text-[1.45rem] font-semibold leading-none text-[var(--text)] md:text-[1.65rem]">{day}</span>
      {month ? <span className="mt-1 block text-[10px] font-semibold uppercase tracking-[var(--tracking-marker)] text-[var(--accent)]">{month}</span> : null}
    </div>
  );
}
