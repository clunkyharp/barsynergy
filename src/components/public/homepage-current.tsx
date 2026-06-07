import Link from 'next/link';
import { ArrowUpRight, BookOpen, BriefcaseBusiness, CalendarDays, Coffee, PackageCheck } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { displayFont } from '@/lib/fonts';
import type { HomepageLiveCard } from '@/lib/public/home';

function normalizedMetaKey(value: string) {
  return value.trim().toLowerCase();
}

function getVisibleFeaturedMeta(card: HomepageLiveCard) {
  const hiddenMeta = new Set(['Открытый доступ', card.eyebrow].map(normalizedMetaKey));
  const seenMeta = new Set<string>();

  return card.meta
    .map((entry) => entry.trim())
    .filter((entry) => {
      if (!entry) {
        return false;
      }

      const key = normalizedMetaKey(entry);

      if (hiddenMeta.has(key) || seenMeta.has(key)) {
        return false;
      }

      seenMeta.add(key);
      return true;
    })
    .slice(0, 3);
}

const featuredKindConfig: Record<string, { icon: LucideIcon; label: string }> = {
  article: { icon: BookOpen, label: 'Материал' },
  course: { icon: Coffee, label: 'Курс' },
  event: { icon: CalendarDays, label: 'Событие' },
  vacancy: { icon: BriefcaseBusiness, label: 'Вакансия' },
  supplier: { icon: PackageCheck, label: 'Поставщик' }
};

export function FeaturedNowCard({ card }: { card: HomepageLiveCard }) {
  const visibleMeta = getVisibleFeaturedMeta(card);
  const supportMeta = card.meta.filter(Boolean).slice(0, 2);
  const kindInfo = featuredKindConfig[card.kind] ?? { icon: BookOpen, label: 'Материал' };
  const KindIcon = kindInfo.icon;

  return (
    <Link
      className="public-card-shell featured-now-card group grid overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] md:rounded-[var(--radius-xl)] lg:grid-cols-[minmax(0,0.82fr)_minmax(0,1fr)]"
      href={card.href}
    >
      <span
        aria-hidden="true"
        className="featured-now-media min-h-[118px] bg-[linear-gradient(135deg,rgba(153,44,38,0.13),rgba(20,20,18,0.08))] bg-cover bg-center grayscale-[0.08] transition-transform duration-[var(--motion-duration-media)] ease-[var(--motion-ease-move)] group-hover:scale-[1.02] motion-reduce:transition-none sm:min-h-[150px] lg:min-h-full lg:max-h-[480px]"
        style={card.imageUrl ? { backgroundImage: `url("${card.imageUrl}")` } : undefined}
      />
      <span className="featured-now-content flex min-w-0 flex-col p-4 md:p-6">
        <span className="featured-now-meta-row flex flex-wrap gap-2">
          <span className="public-card-label w-fit">
            {card.eyebrow}
          </span>
          {visibleMeta.map((entry) => (
            <span
              className="public-card-meta w-fit text-[var(--muted)]"
              key={entry}
            >
              {entry}
            </span>
          ))}
        </span>
        <span className={`${displayFont.className} featured-now-title mt-3 block text-[1.8rem] font-semibold leading-none text-[var(--text)] md:mt-4 md:text-[2.45rem]`}>
          {card.title}
        </span>
        <span className="featured-now-summary mt-3 block max-h-[4.5rem] max-w-2xl overflow-hidden text-sm leading-6 text-[var(--muted)] md:mt-4 md:max-h-[5.2rem] md:leading-7 md:text-[15px]">{card.summary}</span>
        <span className="mt-auto flex flex-col gap-4">
          <span className="featured-now-support inline-flex items-center gap-2.5 rounded-[var(--radius-sm)] bg-[var(--surface-card-muted)] px-3 py-2.5 text-xs">
            <KindIcon size={16} strokeWidth={1.5} className="shrink-0 text-[var(--accent)]" />
            <span className="font-semibold text-[var(--text)]">{kindInfo.label}</span>
            {supportMeta.length > 0 && (
              <>
                <span className="h-3 w-px bg-[var(--line)]" aria-hidden="true" />
                <span className="text-[var(--muted)]">{supportMeta.join(' · ')}</span>
              </>
            )}
          </span>
          <span className="featured-now-footer flex flex-wrap items-center gap-3 border-t border-[var(--line)] pt-4 md:pt-5">
            <span className="featured-now-action inline-flex items-center gap-2 text-sm font-semibold text-[var(--accent)]">
              {card.actionLabel}
              <ArrowUpRight className="transition-transform duration-[var(--motion-duration-base)] ease-[var(--motion-ease-move)] group-hover:translate-x-1 motion-reduce:transition-none" size={16} strokeWidth={1.8} />
            </span>
          </span>
        </span>
      </span>
    </Link>
  );
}

export function HomeEventsStrip({ event }: { event: HomepageLiveCard }) {
  if (event.isFallback) {
    return null;
  }

  return (
    <section className="background-zone background-zone-ivory border-b border-[var(--line)] py-10 md:py-14" id="home-events">
      <div className="container">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <h2 className={`${displayFont.className} text-[2.35rem] font-semibold leading-none text-[var(--text)] md:text-[3.2rem]`}>
            Ближайшее событие
          </h2>
          <Button className="px-0 text-sm tracking-normal" href="/events" variant="link">
            Вся афиша
            <ArrowUpRight size={16} />
          </Button>
        </div>
        <div className="md:max-w-md">
          <Link
            className="home-event-card block rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--surface-card)] p-5 text-[var(--text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)]"
            href={event.href}
          >
            <span className="block text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--accent)]">{event.eyebrow}</span>
            <span className={`${displayFont.className} mt-4 block text-[1.7rem] font-semibold leading-none text-[var(--text)]`}>{event.title}</span>
            <span className="mt-3 block text-sm leading-6 text-[var(--muted)]">{event.summary}</span>
            <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[var(--accent)]">
              {event.actionLabel}
              <ArrowUpRight size={15} strokeWidth={1.8} />
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
}

export function NowCard({
  label,
  card,
  href,
  actionLabel,
  fallbackMeta = 'Раздел платформы',
  icon
}: {
  label: string;
  card?: HomepageLiveCard;
  href: string;
  actionLabel: string;
  fallbackMeta?: string;
  icon: LucideIcon;
}) {
  return (
    <Link
      className="group grid grid-cols-[2.75rem_minmax(0,1fr)] gap-x-3 border-b border-[var(--line)] py-3 transition-[background-color,border-color,color,box-shadow] duration-[var(--motion-duration-base)] ease-[var(--motion-ease-standard)] hover:border-[var(--accent)]/34 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] motion-reduce:transition-none sm:flex sm:h-full sm:min-h-[11.5rem] sm:flex-col sm:rounded-[var(--radius-lg)] sm:border sm:border-[var(--card-border)] sm:bg-[var(--surface-card)] sm:p-4 sm:shadow-[var(--shadow-card)] sm:hover:border-[var(--card-border-hover)] sm:hover:bg-[var(--surface-card-hover)]"
      href={card?.href ?? href}
    >
      <span className="row-span-4 sm:flex sm:items-start sm:justify-between sm:gap-3">
        <InlineIcon icon={icon} />
        <span className="hidden text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--accent)] sm:inline">{label}</span>
      </span>
      <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--accent)] sm:hidden">{label}</span>
      <h3 className={`${displayFont.className} home-current-support-title mt-1 text-[1.22rem] font-semibold leading-[1.42] text-[var(--text)] group-hover:text-[var(--accent)] sm:mt-5 sm:text-2xl sm:leading-[1.2]`}>
        {card?.title ?? label}
      </h3>
      <p className="mt-1 text-sm leading-5 text-[var(--muted)] sm:mt-3 sm:min-h-10 sm:leading-6">{card ? compactMeta(card) : fallbackMeta}</p>
      <span className="mt-2 inline-flex items-center gap-2 text-sm font-semibold text-[var(--accent)] sm:mt-auto sm:pt-5">
        {actionLabel}
        <span aria-hidden="true">→</span>
      </span>
    </Link>
  );
}

function compactMeta(card: HomepageLiveCard) {
  return card.meta.filter(Boolean).slice(0, 2).join(' / ');
}

function InlineIcon({ icon: Icon }: { icon: LucideIcon }) {
  return (
    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-[var(--radius-sm)] bg-[var(--accent)] text-white">
      <Icon size={20} strokeWidth={1.8} />
    </span>
  );
}
