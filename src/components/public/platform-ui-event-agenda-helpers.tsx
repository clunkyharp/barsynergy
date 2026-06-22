import { displayFont } from '@/lib/fonts';
import type { PublishedContentItem } from '@/lib/public/content';

export function dayLabel(dateIso?: string) {
  if (!dateIso) return '';
  const v = new Date(dateIso);
  return Number.isFinite(v.getTime()) ? v.toLocaleDateString('ru-RU', { day: '2-digit' }) : '';
}

export function monthLabel(dateIso?: string) {
  if (!dateIso) return '';
  const v = new Date(dateIso);
  return Number.isFinite(v.getTime()) ? v.toLocaleDateString('ru-RU', { month: 'short' }).replace('.', '') : '';
}

export function weekdayLabel(dateIso?: string) {
  if (!dateIso) return '';
  const v = new Date(dateIso);
  return Number.isFinite(v.getTime()) ? v.toLocaleDateString('ru-RU', { weekday: 'short' }).replace('.', '') : '';
}

export function getMetaValue(item: PublishedContentItem, label: string) {
  return item.metaGroups?.find((g) => g.label === label)?.value;
}

export function FeaturedDateBlock({ dateIso }: { dateIso?: string }) {
  const day = dayLabel(dateIso);
  const month = monthLabel(dateIso);
  const weekday = weekdayLabel(dateIso);
  if (!day) return null;
  return (
    <div className="shrink-0 text-center">
      <span className={`${displayFont.className} block text-[3.2rem] font-bold leading-none text-[var(--accent)] md:text-[4rem]`}>{day}</span>
      <span className="mt-1 block text-[11px] font-semibold uppercase tracking-[var(--tracking-eyebrow-md)] text-[var(--muted)]">{month}</span>
      <span className="mt-0.5 block text-[11px] font-semibold uppercase tracking-[var(--tracking-eyebrow-sm)] text-[var(--muted)]">{weekday}</span>
    </div>
  );
}

export function CompactDateBlock({ dateIso }: { dateIso?: string }) {
  const day = dayLabel(dateIso);
  const month = monthLabel(dateIso);
  const weekday = weekdayLabel(dateIso);
  if (!day) return null;
  return (
    <div className="shrink-0 text-left">
      <span className={`${displayFont.className} block text-[1.6rem] font-bold leading-none text-[var(--accent)]`}>{day}</span>
      <span className="mt-0.5 block text-[10px] font-semibold uppercase tracking-[var(--tracking-marker)] text-[var(--muted)]">{month}</span>
      <span className="block text-[10px] font-semibold uppercase tracking-[var(--tracking-eyebrow-sm)] text-[var(--muted)]">{weekday}</span>
    </div>
  );
}
