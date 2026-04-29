export function AdminHeader() {
  return (
    <header className="rounded-[1.75rem] border border-[var(--line)] bg-white/90 p-6 shadow-[0_24px_80px_rgba(22,19,15,0.08)] backdrop-blur">
      <div className="grid gap-4 md:grid-cols-[1fr_auto] md:items-end">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--accent)]">Контрольный центр</p>
          <p className="mt-3 text-2xl font-semibold tracking-[-0.03em]">Панель управления BARSYNERGY</p>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--muted)]">
            Сначала разбираем новые заявки и доступы, затем переходим к контенту и справочникам.
          </p>
        </div>
        <div className="grid gap-2 text-sm text-[var(--muted)] md:justify-items-end">
          <span className="rounded-full border border-black/10 bg-[var(--surface)] px-3 py-1.5">Очередь: заявки и доступы</span>
          <span className="rounded-full border border-black/10 bg-[var(--surface)] px-3 py-1.5">Режим: рабочая модерация</span>
        </div>
      </div>
    </header>
  );
}
