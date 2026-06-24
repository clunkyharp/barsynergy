import { ArrowUpRight } from 'lucide-react';
import { displayFont } from '@/lib/fonts';

export function SponsorPlacementMock() {
  return (
    <div aria-hidden="true" className="grid gap-4 rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--surface)] p-4 md:p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="grid h-14 w-28 place-items-center rounded-[var(--radius-md)] border border-dashed border-[var(--border-default)] bg-[var(--surface-wash)] text-[10px] font-bold uppercase tracking-[var(--tracking-eyebrow-md)] text-[var(--muted)]">
          Лого
        </div>
        <span className="rounded-full border border-[var(--accent)]/40 bg-[var(--accent-soft)] px-3 py-1 text-[10px] font-semibold uppercase tracking-[var(--tracking-eyebrow-sm)] text-[var(--text)]">
          Генеральный спонсор
        </span>
      </div>

      <div>
        <p className={`${displayFont.className} text-[1.5rem] font-semibold leading-none text-[var(--text)]`}>Кофейный бренд</p>
        <p className="mt-2 text-[13px] leading-[1.5] text-[var(--muted)]">Поставки, оборудование и продукты для баров и кофеен региона.</p>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {['Кофе', 'Оборудование', 'Упаковка', 'Сервис'].map((chip) => (
          <span
            className="rounded-[var(--radius-sm)] border border-[var(--border-default)] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[var(--tracking-eyebrow-sm)] text-[var(--text)]"
            key={chip}
          >
            {chip}
          </span>
        ))}
      </div>

      <div className="flex items-center justify-between gap-3 rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--surface-wash)] px-4 py-2.5">
        <span className="text-[12px] font-semibold text-[var(--text)]">Связаться со спонсором</span>
        <span className="inline-flex items-center gap-1 text-[12px] font-semibold text-[var(--accent-ink)]">
          Telegram
          <ArrowUpRight size={14} strokeWidth={1.8} />
        </span>
      </div>
    </div>
  );
}
