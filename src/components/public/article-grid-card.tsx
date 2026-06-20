import { Star } from 'lucide-react';
import type { ReactNode } from 'react';
import { AppLink } from '@/components/ui/app-link';
import { displayFont } from '@/lib/fonts';
import type { PublishedContentItem } from '@/lib/public/content';
import { cn } from '@/lib/utils';

const COFFEE_KEYWORDS = [
  'эспрессо', 'кофейни', 'кофейня', 'обжарка', 'бариста',
  'specialty', 'спешелти', 'капучино', 'латте', 'кофе'
];

function highlightKeyword(title: string, label?: string): ReactNode {
  const candidates = [
    ...(label ? [label.toLowerCase()] : []),
    ...COFFEE_KEYWORDS
  ];
  for (const keyword of candidates) {
    const idx = title.toLowerCase().indexOf(keyword);
    if (idx !== -1) {
      return (
        <>
          {title.slice(0, idx)}
          <span className="text-[var(--accent)]">{title.slice(idx, idx + keyword.length)}</span>
          {title.slice(idx + keyword.length)}
        </>
      );
    }
  }
  return title;
}

function extractReadingTime(meta: string[]): string | undefined {
  return meta.find((entry) => /\d+\s*мин/.test(entry));
}

function AuthorAvatar({ name }: { name: string }) {
  const initials = name
    .split(' ')
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
  return (
    <span
      aria-hidden="true"
      className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--surface-muted)] text-[9px] font-bold text-[var(--text-secondary)]"
    >
      {initials}
    </span>
  );
}

export function getArticleFallbackImage(label?: string): string {
  const upper = (label ?? '').toUpperCase();
  if (upper === 'МЕНЮ' || upper === 'ЭКОНОМИКА') return '/images/generated/content-guide.jpg';
  if (upper === 'КОМАНДА' || upper === 'СЕРВИС') return '/images/generated/content-service.jpg';
  if (upper === 'СОБЫТИЯ') return '/images/home/hero-bar-counter-bundo.jpg';
  return '/images/home/hero-coffee-counter-haberdoedas.jpg';
}

function formatArticleDate(dateIso?: string): string | undefined {
  if (!dateIso) return undefined;
  const date = new Date(dateIso);
  if (Number.isNaN(date.getTime())) return undefined;
  return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });
}

export function ArticleFeaturedCard({
  item,
  basePath
}: {
  item: PublishedContentItem;
  basePath: string;
}) {
  const href = `${basePath}/${item.slug}`;
  const imageUrl = item.imageUrl ?? getArticleFallbackImage(item.label);
  const date = formatArticleDate(item.dateIso) ?? extractReadingTime(item.meta);

  return (
    <AppLink
      className="group grid overflow-hidden rounded-[var(--radius-xl)] border border-[var(--border-subtle)] bg-[var(--surface-card)] transition-colors duration-[var(--motion-duration-base)] ease-[var(--motion-ease-standard)] hover:border-[var(--border-strong)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)] md:grid-cols-2"
      href={href}
    >
      <div className="relative min-h-[220px] overflow-hidden bg-[var(--surface-muted)] md:min-h-[320px]">
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-cover bg-center transition-transform duration-[var(--motion-duration-media)] ease-[var(--motion-ease-move)] group-hover:scale-[1.03] motion-reduce:transition-none"
          style={{ backgroundImage: `url("${imageUrl}")` }}
        />
      </div>
      <div className="flex flex-col justify-center gap-3 p-6 md:p-10">
        <span className="inline-flex items-center gap-1.5 self-start rounded-[var(--radius-pill)] bg-[var(--accent)] px-3 py-1 text-[12px] font-semibold uppercase tracking-[var(--tracking-eyebrow-sm)] text-[var(--accent-contrast)]">
          <Star fill="currentColor" size={11} />
          Выбор редакции
        </span>
        <h2
          className={cn(
            displayFont.className,
            'text-[1.5rem] font-semibold leading-[1.3] text-[var(--text)] transition-colors group-hover:text-[var(--accent)] md:text-[1.9rem]'
          )}
        >
          {item.title}
        </h2>
        {item.summary ? (
          <p className="line-clamp-3 text-[15px] leading-7 text-[var(--muted)]">{item.summary}</p>
        ) : null}
        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[13px] text-[var(--muted)]">
          {item.label ? <span>{item.label}</span> : null}
          {item.label && date ? <span aria-hidden="true" className="h-[3px] w-[3px] rounded-full bg-[var(--muted)] opacity-50" /> : null}
          {date ? <span>{date}</span> : null}
        </div>
      </div>
    </AppLink>
  );
}

export function ArticleCard({
  item,
  basePath
}: {
  item: PublishedContentItem;
  basePath: string;
}) {
  const href = `${basePath}/${item.slug}`;
  const imageUrl = item.imageUrl ?? getArticleFallbackImage(item.label);
  const date = formatArticleDate(item.dateIso) ?? extractReadingTime(item.meta);

  return (
    <AppLink
      className="group flex flex-col overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--surface-card)] transition-[border-color,background-color,box-shadow] duration-[var(--motion-duration-base)] ease-[var(--motion-ease-standard)] hover:border-[var(--border-strong)] hover:shadow-[var(--shadow-card)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)] motion-reduce:transition-none"
      href={href}
    >
      <div className="relative h-[180px] w-full overflow-hidden bg-[var(--surface-muted)]">
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-cover bg-center transition-transform duration-[var(--motion-duration-media)] ease-[var(--motion-ease-move)] group-hover:scale-[1.04] motion-reduce:transition-none"
          style={{ backgroundImage: `url("${imageUrl}")` }}
        />
      </div>
      <div className="flex flex-1 flex-col p-5">
        {item.label ? (
          <span className="inline-flex items-center self-start rounded-[var(--radius-pill)] border border-[var(--border-default)] px-2.5 py-[3px] text-[11px] font-semibold uppercase tracking-[var(--tracking-eyebrow-sm)] text-[var(--muted)]">
            {item.label}
          </span>
        ) : null}
        <h3
          className={cn(
            displayFont.className,
            'mt-2.5 line-clamp-3 text-base font-semibold leading-[1.45] text-[var(--text)] transition-colors group-hover:text-[var(--accent)]'
          )}
        >
          {item.title}
        </h3>
        {date ? <span className="mt-3 text-[13px] text-[var(--muted)]">{date}</span> : null}
      </div>
    </AppLink>
  );
}

export function ArticleListItem({
  item,
  basePath
}: {
  item: PublishedContentItem;
  basePath: string;
}) {
  const href = `${basePath}/${item.slug}`;
  const readingTime = extractReadingTime(item.meta);
  const imageUrl = item.imageUrl ?? getArticleFallbackImage(item.label);

  return (
    <AppLink
      className="group flex items-center gap-3 py-3 sm:gap-4 sm:py-4 transition-opacity duration-[var(--motion-duration-fast)] hover:opacity-75 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 motion-reduce:transition-none"
      href={href}
    >
      <div className="relative h-[56px] w-20 shrink-0 overflow-hidden rounded-[var(--radius-md)] sm:h-[72px]">
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url("${imageUrl}")` }}
        />
      </div>
      <div className="min-w-0 flex-1">
        <h3
          className={cn(
            displayFont.className,
            'line-clamp-2 text-[0.9rem] font-semibold leading-[1.2] text-[var(--text)] sm:text-[1rem]'
          )}
        >
          {highlightKeyword(item.title, item.label)}
        </h3>
        <div className="mt-0.5 flex items-center gap-1.5 text-[11px] text-[var(--muted)] sm:mt-1">
          {item.authorName ? (
            <>
              <AuthorAvatar name={item.authorName} />
              <span>{item.authorName}</span>
            </>
          ) : null}
          {readingTime ? (
            <>
              {item.authorName ? <span className="text-[var(--line)]">·</span> : null}
              <span>{readingTime}</span>
            </>
          ) : null}
          {item.label ? (
            <>
              {(item.authorName || readingTime) ? <span className="text-[var(--line)]">·</span> : null}
              <span>{item.label}</span>
            </>
          ) : null}
        </div>
      </div>
    </AppLink>
  );
}
