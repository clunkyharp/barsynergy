import { ArrowRight, Star } from 'lucide-react';
import type { ReactNode } from 'react';
import { AppLink } from '@/components/ui/app-link';
import { HighlightChip } from '@/components/ui/highlight-chip';
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

function getArticleFallbackImage(label?: string): string {
  const upper = (label ?? '').toUpperCase();
  if (upper === 'МЕНЮ' || upper === 'ЭКОНОМИКА') return '/images/generated/content-guide.jpg';
  if (upper === 'КОМАНДА' || upper === 'СЕРВИС') return '/images/generated/content-service.jpg';
  if (upper === 'СОБЫТИЯ') return '/images/home/hero-bar-counter-bundo.jpg';
  return '/images/home/hero-coffee-counter-haberdoedas.jpg';
}

export function ArticleFeaturedCard({
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
      className="group relative flex aspect-[21/9] min-h-[360px] w-full overflow-hidden rounded-[var(--radius-xl)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)] sm:min-h-[440px]"
      href={href}
    >
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-cover bg-center transition-transform duration-700 ease-out group-hover:scale-[1.02] motion-reduce:transition-none"
        style={{ backgroundImage: `url("${imageUrl}")` }}
      />
      <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-black/92 via-black/50 to-black/20" />
      <div className="relative flex w-full flex-col justify-between p-6 sm:p-8">
        <div>
          <HighlightChip variant="editor">
            <Star fill="currentColor" size={10} />
            Выбор редакции
          </HighlightChip>
        </div>
        <div className="mt-auto">
          <h2
            className={cn(
              displayFont.className,
              'mt-6 text-[1.75rem] font-semibold leading-[1.1] text-white sm:text-[2.25rem]'
            )}
          >
            {highlightKeyword(item.title, item.label)}
          </h2>
          {item.summary ? (
            <p className="mt-3 line-clamp-2 max-w-2xl text-[15px] leading-6 text-white/70">
              {item.summary}
            </p>
          ) : null}
          <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-[13px] text-white/60">
              {item.authorName ? (
                <>
                  <AuthorAvatar name={item.authorName} />
                  <span>{item.authorName}</span>
                  {(readingTime ?? item.label) ? <span className="text-white/30">·</span> : null}
                </>
              ) : null}
              {readingTime ? (
                <>
                  <span>{readingTime}</span>
                  {item.label ? <span className="text-white/30">·</span> : null}
                </>
              ) : null}
              {item.label ? <span>{item.label}</span> : null}
            </div>
            <span className="inline-flex shrink-0 items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-[13px] font-semibold text-white backdrop-blur-sm transition-colors duration-[var(--motion-duration-base)] group-hover:bg-white/20 motion-reduce:transition-none">
              Читать материал
              <ArrowRight
                className="transition-transform duration-[var(--motion-duration-base)] group-hover:translate-x-1 motion-reduce:transition-none"
                size={14}
              />
            </span>
          </div>
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
  const readingTime = extractReadingTime(item.meta);
  const imageUrl = item.imageUrl ?? getArticleFallbackImage(item.label);

  return (
    <AppLink
      className="group relative flex flex-col overflow-hidden rounded-[var(--radius-xl)] border border-[var(--border-default)] bg-[var(--surface-card)] transition-shadow duration-[var(--motion-duration-base)] ease-[var(--motion-ease-standard)] hover:shadow-[var(--shadow-card)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)] motion-reduce:transition-none"
      href={href}
    >
      <div className="relative aspect-[16/9] w-full overflow-hidden">
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-cover bg-center transition-transform duration-500 ease-out group-hover:scale-[1.04] motion-reduce:transition-none"
          style={{ backgroundImage: `url("${imageUrl}")` }}
        />
        {item.label ? (
          <HighlightChip className="absolute left-3 top-3" surface="image">
            {item.label}
          </HighlightChip>
        ) : null}
      </div>
      <div className="flex flex-1 flex-col p-4 sm:p-5">
        <h3
          className={cn(
            displayFont.className,
            'font-semibold leading-[1.15] text-[var(--text)] line-clamp-3',
            'text-[1.1rem] sm:text-[1.2rem]'
          )}
        >
          {highlightKeyword(item.title, item.label)}
        </h3>
        {item.summary ? (
          <p className="mt-2 text-[13px] leading-5 text-[var(--muted)] line-clamp-2">
            {item.summary}
          </p>
        ) : null}
        <div className="mt-auto flex items-center gap-2 pt-3 text-[12px] text-[var(--muted)]">
          {item.authorName ? (
            <>
              <AuthorAvatar name={item.authorName} />
              <span>{item.authorName}</span>
            </>
          ) : null}
          {readingTime ? (
            <>
              <span className="text-[var(--line)]">·</span>
              <span>{readingTime}</span>
            </>
          ) : null}
          {item.label ? (
            <>
              <span className="text-[var(--line)]">·</span>
              <span>{item.label}</span>
            </>
          ) : null}
        </div>
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
