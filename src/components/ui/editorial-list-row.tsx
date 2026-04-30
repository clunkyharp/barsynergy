import type { HTMLAttributes, ReactNode } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { cn } from '@/lib/utils';

type EditorialListRowProps = HTMLAttributes<HTMLElement> & {
  label: ReactNode;
  title: ReactNode;
  description: ReactNode;
  media?: ReactNode;
  meta?: ReactNode;
  columns?: 'default' | 'content';
  as?: 'article' | 'div';
  href?: string;
  actionLabel?: string;
};

export function EditorialListRow({
  as = 'article',
  className,
  columns = 'default',
  description,
  label,
  media,
  meta,
  title,
  href,
  actionLabel = 'Открыть',
  ...props
}: EditorialListRowProps) {
  const Component = as;
  const content = (
    <>
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--accent)]">{label}</p>
        {media ? <div className="mt-4">{media}</div> : null}
      </div>
      <div>
        <h3 className="text-xl font-semibold uppercase leading-7">{title}</h3>
        {meta ? <div className="mt-3">{meta}</div> : null}
        {href ? (
          <div className="mt-4 inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--accent)]">
            <span>{actionLabel}</span>
            <ArrowUpRight size={16} />
          </div>
        ) : null}
      </div>
      <div className="max-w-2xl text-sm leading-7 text-[var(--muted)]">{description}</div>
    </>
  );

  if (href) {
    return (
      <article className="border-b border-black/20" {...props}>
        <a
          className={cn(
            'group grid gap-4 py-6 transition-colors hover:bg-black/[0.02] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--accent)] focus-visible:ring-inset',
            columns === 'default' && 'md:grid-cols-[0.22fr_0.5fr_0.78fr]',
            columns === 'content' && 'md:grid-cols-[0.26fr_0.52fr_0.72fr]',
            className
          )}
          href={href}
        >
          {content}
        </a>
      </article>
    );
  }

  return (
    <Component
      className={cn(
        'grid gap-4 border-b border-black/20 py-6',
        columns === 'default' && 'md:grid-cols-[0.22fr_0.5fr_0.78fr]',
        columns === 'content' && 'md:grid-cols-[0.26fr_0.52fr_0.72fr]',
        className
      )}
      {...props}
    >
      {content}
    </Component>
  );
}
