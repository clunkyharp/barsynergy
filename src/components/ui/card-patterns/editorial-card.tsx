import { ArrowUpRight } from 'lucide-react';
import type { ReactNode } from 'react';
import { AppLink } from '@/components/ui/app-link';
import { Button } from '@/components/ui/button';
import { displayFont } from '@/lib/fonts';
import { cn } from '@/lib/utils';

type EditorialCardAction = {
  label: string;
  href: string;
};

type EditorialCardProps = {
  imageUrl?: string;
  imageAlt?: string;
  eyebrow?: string;
  tags?: string[];
  title: string;
  summary?: string;
  meta?: ReactNode;
  action?: EditorialCardAction;
  href?: string;
  isFeatured?: boolean;
  className?: string;
};

export function EditorialCard({
  imageUrl,
  eyebrow,
  tags,
  title,
  summary,
  meta,
  action,
  href,
  isFeatured,
  className
}: EditorialCardProps) {
  const cardClasses = cn(
    'flex flex-col overflow-hidden rounded-[var(--radius-xl)] border border-[var(--border-default)] bg-[var(--surface-card)]',
    href && 'transition-shadow duration-[var(--motion-duration-base)] ease-[var(--motion-ease-standard)] hover:shadow-[var(--shadow-card)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)] motion-reduce:transition-none group',
    className
  );

  const body = (
    <>
      {imageUrl ? (
        <div className="relative aspect-[4/3] overflow-hidden bg-[var(--surface-muted)]">
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-cover bg-center transition-transform duration-500 ease-out group-hover:scale-[1.04] motion-reduce:transition-none"
            style={{ backgroundImage: `url("${imageUrl}")` }}
          />
          {isFeatured ? (
            <span className="absolute left-3 top-3 rounded-[var(--radius-sm)] bg-[var(--accent)] px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.14em] text-black">
              Рекомендуем
            </span>
          ) : null}
          {tags && tags.length > 0 ? (
            <span className="absolute left-3 top-3 flex flex-wrap gap-1.5">
              {tags.map((tag) => (
                <span
                  className="rounded-sm bg-black/70 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.14em] text-white backdrop-blur-sm"
                  key={tag}
                >
                  {tag}
                </span>
              ))}
            </span>
          ) : null}
        </div>
      ) : null}

      <div className="flex flex-1 flex-col p-4 md:p-5">
        {eyebrow ? (
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--accent)]">
            {eyebrow}
          </p>
        ) : null}

        <h3
          className={cn(
            displayFont.className,
            'line-clamp-2 font-semibold leading-[1.2] text-[var(--text)] transition-colors duration-[var(--motion-duration-base)] group-hover:text-[var(--accent)]',
            eyebrow ? 'mt-1.5' : '',
            'text-[1.1rem] md:text-[1.2rem]'
          )}
        >
          {title}
        </h3>

        {summary ? (
          <p className="mt-2 line-clamp-2 text-[13px] leading-5 text-[var(--muted)]">
            {summary}
          </p>
        ) : null}

        {meta ? (
          <div className="mt-3">
            {meta}
          </div>
        ) : null}

        {action ? (
          <div className="mt-auto flex items-center justify-between gap-3 pt-4">
            <Button
              className="shrink-0 rounded-[var(--radius-md)] px-4"
              href={action.href}
              size="sm"
              variant="secondary"
            >
              {action.label}
              <ArrowUpRight size={14} strokeWidth={1.8} />
            </Button>
          </div>
        ) : null}
      </div>
    </>
  );

  if (href) {
    return <AppLink className={cardClasses} href={href}>{body}</AppLink>;
  }

  return <article className={cardClasses}>{body}</article>;
}
