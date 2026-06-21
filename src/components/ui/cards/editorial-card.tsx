import { ArrowUpRight } from 'lucide-react';
import type { ReactNode } from 'react';
import { AppLink } from '@/components/ui/app-link';
import { Button } from '@/components/ui/button';
import { HighlightChip } from '@/components/ui/highlight-chip';
import { cn } from '@/lib/utils';
import type { CardAction, CardMediaImage, CardTone } from './card-types';
import { cardEyebrowClass, cardFooterClass, cardMetaClass, cardMinHeightClass, cardSummaryClass, cardTitleClass, rootCardClass } from './card-styles';

type EditorialCardSize = 'standard' | 'feature';

type EditorialCardProps = {
  media?: CardMediaImage;
  eyebrow?: string;
  tags?: string[];
  title: string;
  summary?: string;
  meta?: ReactNode;
  action?: CardAction;
  href?: string;
  isFeatured?: boolean;
  size?: EditorialCardSize;
  tone?: CardTone;
  density?: 'comfortable' | 'compact';
  className?: string;
};

const imageClass = 'relative aspect-[4/3] overflow-hidden bg-[var(--surface-muted)]';

export function EditorialCard({
  media,
  eyebrow,
  tags,
  title,
  summary,
  meta,
  action,
  href,
  isFeatured,
  size = 'standard',
  tone = 'light',
  density = 'comfortable',
  className
}: EditorialCardProps) {
  const isDark = tone === 'dark';
  const body = (
    <>
      {media?.src ? (
        <div className={imageClass}>
          <div
            aria-hidden="true"
            className="gpu absolute inset-0 bg-cover bg-center transition-transform duration-[var(--motion-duration-media)] ease-[var(--motion-ease-move)] group-hover:scale-[1.04] motion-reduce:transition-none"
            style={{ backgroundImage: `url("${media.src}")` }}
          />
          {isFeatured ? (
            <HighlightChip className="absolute left-3 top-3" variant="editor">
              Рекомендуем
            </HighlightChip>
          ) : null}
          {tags && tags.length > 0 ? (
            <span className="absolute left-3 top-3 flex flex-wrap gap-1.5">
              {tags.map((tag) => (
                <HighlightChip key={tag} surface="image">
                  {tag}
                </HighlightChip>
              ))}
            </span>
          ) : null}
        </div>
      ) : null}

      <div className={cn('flex flex-1 flex-col', density === 'comfortable' ? 'p-4 md:p-5' : 'p-3')}>
        {eyebrow ? (
          <p className={cardEyebrowClass()}>{eyebrow}</p>
        ) : null}

        <h3 className={cn(
          cardTitleClass(density),
          'transition-colors duration-[var(--motion-duration-base)] group-hover:text-[var(--accent)]',
          isDark && 'text-[var(--editorial-dark-text)]',
          eyebrow ? 'mt-1.5' : '',
        )}>
          {title}
        </h3>

        {summary ? (
          <p className={cardSummaryClass()}>{summary}</p>
        ) : null}

        {meta ? <div className={cardMetaClass()}>{meta}</div> : null}

        {action ? (
          <div className={cardFooterClass()}>
            {href ? (
              <span className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[var(--radius-md)] border border-[var(--border-strong)] bg-[var(--surface)] px-3.5 text-[13px] font-semibold leading-5 text-[var(--text)] shadow-none h-9 py-[7px] shrink-0">
                {action.label}
                <ArrowUpRight size={14} strokeWidth={1.8} />
              </span>
            ) : (
              <Button
                className="shrink-0 rounded-[var(--radius-md)] px-4"
                href={action.href}
                size="sm"
                variant="secondary"
              >
                {action.label}
                <ArrowUpRight size={14} strokeWidth={1.8} />
              </Button>
            )}
          </div>
        ) : null}
      </div>
    </>
  );

  const minHClass = cardMinHeightClass(size);

  if (href) {
    return (
      <AppLink className={cn(rootCardClass(className, { hasHover: true, isClickable: true }), minHClass)} href={href}>
        {body}
      </AppLink>
    );
  }

  return <article className={cn(rootCardClass(className), minHClass)}>{body}</article>;
}
