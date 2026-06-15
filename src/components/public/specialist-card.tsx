'use client';

import { displayFont } from '@/lib/fonts';
import { cn } from '@/lib/utils';
import { BadgeCheck, Briefcase, Search } from 'lucide-react';
import type { SpecialistCardItem } from '@/lib/public/content';
import { AppLink } from '@/components/ui/app-link';

type SpecialistCardProps = {
  item: SpecialistCardItem;
  rowActionLabel?: string;
};

export function SpecialistCard({ item, rowActionLabel }: SpecialistCardProps) {
  const isSeeking = item.mode === 'seeking';

  return (
    <article className="group relative flex flex-col gap-3 rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--surface-card)] p-4 transition-shadow hover:shadow-sm md:flex-row md:items-start md:gap-4 md:p-5">
      {item.imageUrl ? (
        <div className="size-12 shrink-0 overflow-hidden rounded-full border border-[var(--border-default)] md:size-14">
          <img
            alt=""
            className="size-full object-cover"
            src={item.imageUrl}
          />
        </div>
      ) : (
        <div className="flex size-12 shrink-0 items-center justify-center rounded-full border border-[var(--border-default)] bg-[var(--surface-wash)] md:size-14">
          <span className="text-lg text-[var(--muted)]">
            {isSeeking ? <Search size={20} /> : <Briefcase size={20} />}
          </span>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <span className={cn(displayFont.className, 'text-base font-semibold leading-5 tracking-tight md:text-lg')}>
            {item.title}
          </span>
          {item.isVerified && (
            <BadgeCheck
              aria-label="Проверено"
              className="shrink-0 text-[var(--accent)]"
              size={18}
              strokeWidth={2}
            />
          )}
        </div>

        {item.subtitle && (
          <p className="text-sm leading-4 text-[var(--muted)]">{item.subtitle}</p>
        )}

        <div className="flex flex-wrap gap-1.5">
          <span className={cn(
            'inline-flex items-center gap-1 rounded-[var(--radius-pill)] px-2 py-0.5 text-[11px] font-semibold leading-[14px]',
            isSeeking
              ? 'border border-[var(--accent)]/30 bg-[var(--accent)]/10 text-[var(--accent-strong)]'
              : 'border border-[var(--border-default)] bg-[var(--surface-wash)] text-[var(--muted)]'
          )}>
            {isSeeking ? <Search size={10} strokeWidth={2.5} /> : <Briefcase size={10} strokeWidth={2.5} />}
            {isSeeking ? 'Ищу работу' : 'Предлагаю услуги'}
          </span>
          {item.isNew && (
            <span className="inline-flex items-center rounded-[var(--radius-pill)] border border-[var(--success-border)] bg-[var(--success-bg)] px-2 py-0.5 text-[11px] font-semibold leading-[14px] text-[var(--success-text)]">
              Новое
            </span>
          )}
        </div>

        <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm leading-5 text-[var(--editorial-dark-muted)]">
          {item.meta.map((m, i) => (
            <span key={i}>{m}</span>
          ))}
        </div>

        {item.summary && (
          <p className="text-sm leading-5 text-[var(--muted)] line-clamp-2">{item.summary}</p>
        )}
      </div>

      <div className="flex shrink-0 items-center md:self-center">
        <AppLink
          className="inline-flex h-10 items-center justify-center whitespace-nowrap rounded-[var(--radius-md)] border border-[var(--accent)] px-4 text-[13px] font-semibold leading-4 text-[var(--accent)] transition-colors hover:bg-[var(--accent)] hover:text-[var(--accent-contrast)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)]"
          href={item.detailUrl}
        >
          {rowActionLabel ?? (isSeeking ? 'Смотреть резюме' : 'Подробнее')}
        </AppLink>
      </div>
    </article>
  );
}
