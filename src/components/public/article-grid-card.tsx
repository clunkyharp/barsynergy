import { ArrowRight } from 'lucide-react';
import { AppLink } from '@/components/ui/app-link';
import { displayFont } from '@/lib/fonts';
import type { PublishedContentItem } from '@/lib/public/content';
import { cn } from '@/lib/utils';

function extractReadingTime(meta: string[]): string | undefined {
  return meta.find((entry) => /\d+\s*мин/.test(entry));
}

function getArticleFallbackImage(label?: string): string {
  const upper = (label ?? '').toUpperCase();
  if (upper === 'МЕНЮ' || upper === 'ЭКОНОМИКА') return '/images/generated/content-guide.jpg';
  if (upper === 'КОМАНДА' || upper === 'СЕРВИС') return '/images/generated/content-service.jpg';
  if (upper === 'СОБЫТИЯ') return '/images/home/hero-bar-counter-bundo.jpg';
  return '/images/home/hero-coffee-counter-haberdoedas.jpg';
}

export function ArticleCard({
  item,
  basePath,
  featured
}: {
  item: PublishedContentItem;
  basePath: string;
  featured?: boolean;
}) {
  const href = `${basePath}/${item.slug}`;
  const readingTime = extractReadingTime(item.meta);

  const coverStyle = item.imageUrl
    ? { backgroundImage: `url("${item.imageUrl}")`, backgroundSize: 'cover' as const, backgroundPosition: 'center' as const }
    : { backgroundImage: `url("${getArticleFallbackImage(item.label)}")`, backgroundSize: 'cover' as const, backgroundPosition: 'center' as const };

  if (featured) {
    return (
      <AppLink
        className="group relative overflow-hidden rounded-[var(--radius-xl)] border border-[var(--border-default)] bg-[var(--surface-card)] transition-shadow duration-[var(--motion-duration-base)] ease-[var(--motion-ease-standard)] hover:shadow-[var(--shadow-card)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)] motion-reduce:transition-none sm:col-span-full sm:grid sm:grid-cols-[1.2fr_1fr]"
        href={href}
      >
        <div
          className="aspect-[16/9] w-full sm:h-full sm:aspect-auto"
          style={coverStyle}
          aria-hidden="true"
        />
        <div className="flex flex-col p-5 sm:p-8">
          <div className="flex items-center justify-between gap-3">
            <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--accent)]">
              {item.label ?? 'Статья'}
            </span>
            {readingTime ? (
              <span className="shrink-0 text-[11px] text-[var(--muted)]">
                {readingTime}
              </span>
            ) : null}
          </div>
          <h3 className={cn(
            displayFont.className,
            'mt-3 font-semibold leading-[1.1] text-[var(--text)]',
            'text-[1.45rem] sm:text-[2rem]'
          )}>
            {item.title}
          </h3>
          {item.summary ? (
            <p className="mt-3 text-[15px] leading-7 text-[var(--muted)] line-clamp-3">
              {item.summary}
            </p>
          ) : null}
          <div className="mt-auto flex items-center gap-2 pt-5 text-sm font-semibold text-[var(--accent)]">
            <span>Читать</span>
            <ArrowRight className="transition-transform duration-[var(--motion-duration-base)] ease-[var(--motion-ease-move)] group-hover:translate-x-1 motion-reduce:transition-none" size={16} />
          </div>
        </div>
      </AppLink>
    );
  }

  return (
    <AppLink
      className="group relative flex flex-col overflow-hidden rounded-[var(--radius-xl)] border border-[var(--border-default)] bg-[var(--surface-card)] transition-shadow duration-[var(--motion-duration-base)] ease-[var(--motion-ease-standard)] hover:shadow-[var(--shadow-card)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)] motion-reduce:transition-none"
      href={href}
    >
      <div
        className="aspect-[16/9] w-full"
        style={coverStyle}
        aria-hidden="true"
      />
      <div className="flex flex-1 flex-col p-4 sm:p-5">
        <div className="flex items-center justify-between gap-3">
          <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--accent)]">
            {item.label ?? 'Статья'}
          </span>
          {readingTime ? (
            <span className="shrink-0 text-[11px] text-[var(--muted)]">
              {readingTime}
            </span>
          ) : null}
        </div>
        <h3 className={cn(
          displayFont.className,
          'mt-2 font-semibold leading-[1.1] text-[var(--text)] line-clamp-2',
          'text-[1.2rem] sm:text-[1.35rem]'
        )}>
          {item.title}
        </h3>
        {item.summary ? (
          <p className="mt-2 text-[14px] leading-6 text-[var(--muted)] line-clamp-2">
            {item.summary}
          </p>
        ) : null}
        <div className="mt-auto flex items-center justify-between border-t border-[var(--line)] px-0 pt-2.5">
          {item.updatedLabel ? (
            <span className="text-[11px] text-[var(--muted)]">{item.updatedLabel}</span>
          ) : <span />}
          {readingTime ? (
            <span className="text-[11px] text-[var(--muted)]">{readingTime}</span>
          ) : null}
        </div>
      </div>
    </AppLink>
  );
}
