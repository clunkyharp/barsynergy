import { Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { displayFont } from '@/lib/fonts';
import { cn } from '@/lib/utils';
import type { packageLevels } from '@/lib/public/general-sponsors-page-data';

export function SponsorPackageCard({
  pkg,
  index
}: {
  pkg: (typeof packageLevels)[number];
  index: number;
}) {
  return (
    <article
      className={cn(
        'relative flex flex-col rounded-[var(--radius-lg)] border',
        pkg.recommended
          ? 'z-10 border-[var(--accent)] bg-[var(--accent-soft)] p-6 pt-9 shadow-[0_18px_50px_-12px_var(--accent)] md:-my-4 md:p-8 md:pt-10'
          : 'border-[var(--border-default)] bg-[var(--surface-card)] p-6 shadow-[var(--shadow-card)] transition-[border-color,box-shadow] duration-[var(--motion-duration-base)] hover:border-[var(--accent)]/20 hover:shadow-[var(--shadow-panel)] md:p-7'
      )}
      key={index}
    >
      {pkg.recommended ? (
        <span className="absolute -top-3 left-1/2 inline-flex -translate-x-1/2 items-center whitespace-nowrap rounded-full border border-[var(--accent)] bg-[var(--accent)] px-3.5 py-1 text-[11px] font-bold uppercase tracking-[0.1em] text-[var(--accent-contrast)] shadow-sm">
          Главный формат
        </span>
      ) : null}

      <div>
        <h3 className={`${displayFont.className} text-[2rem] font-semibold leading-none text-[var(--text)] md:text-[2.2rem]`}>
          {pkg.packageName}
        </h3>
        <p className="mt-2.5 text-sm leading-6 text-[var(--muted)]">{pkg.scope}</p>
      </div>

      <div className="my-5 border-t border-[var(--line)]" />

      <div>
        <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--muted)]">Период</p>
        <p className={`${displayFont.className} mt-1.5 text-[1.6rem] font-semibold leading-[1.1] text-[var(--text)]`}>
          {pkg.periodLabel}
        </p>
      </div>

      <div className="mt-6">
        <Button
          className={cn(
            'w-full rounded-[var(--radius-md)]',
            !pkg.recommended &&
              'border-[var(--border-strong)] bg-transparent text-[var(--text)] hover:border-[var(--accent)]/30 hover:bg-[var(--surface-wash)]'
          )}
          href={`/contacts?topic=sponsorship&partnerType=${encodeURIComponent(pkg.packageName)}#contact-form`}
          variant={pkg.recommended ? 'primary' : 'secondary'}
        >
          Запросить условия
        </Button>
      </div>

      <div className="my-5 border-t border-[var(--line)]" />

      <ul className="grid flex-1 gap-3">
        {pkg.placements.map((item) => (
          <li className="flex items-center gap-2.5 text-sm leading-[1.5] text-[var(--text)]" key={item}>
            <span
              aria-hidden="true"
              className={cn(
                'grid size-5 shrink-0 place-items-center rounded-full',
                pkg.recommended
                  ? 'bg-[var(--accent)] text-[var(--accent-contrast)]'
                  : 'bg-[var(--accent-soft)] text-[var(--accent)]'
              )}
            >
              <Check size={12} strokeWidth={3} />
            </span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </article>
  );
}
