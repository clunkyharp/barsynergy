import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { bodyFont, displayFont } from '@/lib/fonts';
import type { HomepageLiveCard } from '@/lib/public/home';

function extractReadingTime(meta: string[]): string | undefined {
  return meta.find((entry) => /\d+\s*мин/.test(entry));
}

function buildFeaturedFooterMeta(card: HomepageLiveCard): string {
  const kindLabels: Record<string, string> = {
    article: 'Материал',
    course: 'Курс',
    event: 'Событие',
    vacancy: 'Вакансия',
    supplier: 'Поставщик'
  };
  const kindLabel = kindLabels[card.kind] ?? 'Материал';
  const parts: string[] = [kindLabel];

  if (card.authorName) {
    parts.push(`Автор: ${card.authorName}`);
  }

  const readingTime = extractReadingTime(card.meta);
  if (readingTime) {
    parts.push(`${readingTime} чтения`);
  }

  return parts.join(' · ');
}

function supportMetaText(card: HomepageLiveCard) {
  return card.meta.filter(Boolean).slice(0, 2).join(' / ');
}

export function EditorialFeatured({ card }: { card: HomepageLiveCard }) {
  const footerMeta = buildFeaturedFooterMeta(card);

  return (
    <Link
      aria-label={`${card.eyebrow}: ${card.title}`}
      className="editorial-featured group relative block aspect-[3/2] overflow-hidden rounded-[var(--radius-xl)] border border-white/8 md:aspect-[21/9] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--editorial-dark-surface)]"
      href={card.href}
    >
      <span
        aria-hidden="true"
        className="editorial-featured-media absolute inset-0 bg-cover bg-center transition-transform duration-[var(--motion-duration-media)] ease-[var(--motion-ease-move)] group-hover:scale-[1.015] motion-reduce:transition-none"
        style={card.imageUrl ? { backgroundImage: `url("${card.imageUrl}")` } : undefined}
      />
      <span aria-hidden="true" className="editorial-featured-gradient absolute inset-0" />

      <span className="editorial-featured-content absolute inset-0 flex flex-col justify-end p-5 md:p-8 lg:p-10">
        <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[var(--tracking-marker)] text-[var(--accent)] md:mb-2">
          {card.eyebrow}
        </span>

        <h3 className={`${displayFont.className} editorial-featured-headline text-[1.6rem] font-bold leading-[1.05] tracking-[-0.01em] text-[var(--editorial-dark-text)] md:text-[2.2rem] lg:text-[3rem]`}>
          {card.title}
        </h3>

        <p className={`${bodyFont.className} editorial-featured-summary mt-3 max-w-[38rem] text-sm leading-[1.6] text-[var(--editorial-dark-muted)] md:mt-4 md:text-[15px]`}>
          {card.summary}
        </p>

        <span className="editorial-featured-footer mt-5 flex flex-col gap-3 md:mt-6 md:flex-row md:items-center md:gap-6">
          <span className="editorial-featured-cta inline-flex w-fit items-center gap-2 rounded-[var(--radius-pill)] border border-[var(--accent)]/50 px-4 py-2 text-sm font-semibold text-[var(--editorial-dark-text)] transition-colors duration-[var(--motion-duration-fast)] group-hover:border-[var(--accent)] group-hover:text-[var(--accent)]">
            {card.actionLabel}
            <ArrowUpRight size={15} strokeWidth={2} />
          </span>
          <span className={`${bodyFont.className} text-xs leading-5 text-[var(--editorial-dark-muted)] md:leading-none`}>
            {footerMeta}
          </span>
        </span>
      </span>
    </Link>
  );
}

export function EditorialSupportCard({
  card,
  label,
  actionLabel,
  fallbackMeta = 'Раздел платформы'
}: {
  card?: HomepageLiveCard;
  label: string;
  actionLabel: string;
  fallbackMeta?: string;
}) {
  const title = card?.title ?? label;
  const summary = card ? supportMetaText(card) : fallbackMeta;
  const href = card?.href ?? '#';
  const imageUrl = card?.imageUrl;

  return (
    <Link
      className="editorial-support-card group flex flex-col overflow-hidden rounded-[var(--radius-lg)] border border-white/8 bg-[var(--editorial-dark-surface-muted)] transition-[border-color,box-shadow] duration-[var(--motion-duration-base)] hover:border-[var(--accent)]/40 hover:shadow-[0_4px_24px_rgba(0,0,0,0.3)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
      href={href}
    >
      <span className="editorial-support-media relative block aspect-[16/10] overflow-hidden bg-[var(--editorial-dark-surface)]">
        {imageUrl ? (
          <span
            aria-hidden="true"
            className="absolute inset-0 bg-cover bg-center transition-transform duration-[var(--motion-duration-media)] ease-[var(--motion-ease-move)] group-hover:scale-[1.04] motion-reduce:transition-none"
            style={{ backgroundImage: `url("${imageUrl}")` }}
          />
        ) : (
          <span aria-hidden="true" className="absolute inset-0 bg-gradient-to-br from-[var(--editorial-dark-surface-muted)] to-[var(--editorial-dark-surface)]" />
        )}
        <span aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        <span className="editorial-support-label absolute left-3 top-3 z-10">{label}</span>
      </span>

      <span className="editorial-support-body flex flex-1 flex-col gap-2 p-4 md:p-5">
        <h3 className={`${displayFont.className} editorial-support-title text-[1.15rem] font-semibold leading-[1.2] text-[var(--editorial-dark-text)] group-hover:text-[var(--accent)] md:text-[1.35rem]`}>
          {title}
        </h3>
        <p className={`${bodyFont.className} editorial-support-summary text-[13px] leading-[1.5] text-[var(--editorial-dark-muted)]`}>
          {summary}
        </p>
        <span className="editorial-support-action mt-auto inline-flex items-center gap-1.5 pt-2 text-[13px] font-semibold text-[var(--accent)] transition-colors duration-[var(--motion-duration-fast)] group-hover:text-[var(--accent-strong)]">
          {actionLabel}
          <ArrowUpRight size={13} strokeWidth={2} />
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
            className="home-event-card block rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--surface-card)] p-4 text-[var(--text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] md:p-5"
            href={event.href}
          >
            <span className="block text-[11px] font-semibold uppercase tracking-[var(--tracking-eyebrow-sm)] text-[var(--accent)]">{event.eyebrow}</span>
            <span className={`${displayFont.className} mt-3 block text-[1.35rem] font-semibold leading-none text-[var(--text)] md:mt-4 md:text-[1.7rem]`}>{event.title}</span>
            <span className="mt-2 block text-sm leading-6 text-[var(--muted)] md:mt-3">{event.summary}</span>
            <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-[var(--accent)] md:mt-5">
              {event.actionLabel}
              <ArrowUpRight size={15} strokeWidth={1.8} />
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
}
