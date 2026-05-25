import type { HTMLAttributes, ReactNode } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { AppLink } from '@/components/ui/app-link';
import { displayFont } from '@/lib/fonts';
import { cn } from '@/lib/utils';

type EditorialListRowProps = HTMLAttributes<HTMLElement> & {
  label: ReactNode;
  title: ReactNode;
  description: ReactNode;
  media?: ReactNode;
  meta?: ReactNode;
  subtitle?: ReactNode;
  labelMeta?: ReactNode;
  columns?: 'default' | 'content';
  as?: 'article' | 'div';
  href?: string;
  actionLabel?: string;
  variant?: 'default' | 'opportunity' | 'directory';
};

export function EditorialListRow({
  as = 'article',
  className,
  columns = 'default',
  description,
  label,
  labelMeta,
  media,
  meta,
  subtitle,
  title,
  href,
  actionLabel = 'Открыть',
  variant = 'default',
  ...props
}: EditorialListRowProps) {
  const Component = as;
  const defaultContent = (
    <>
      <div className="min-w-0">
        <div>{label}</div>
        {labelMeta ? <div className="mt-2 md:mt-3">{labelMeta}</div> : null}
        {media ? <div className="mt-4 hidden md:block">{media}</div> : null}
      </div>
      <div className="min-w-0">
        <h3 className={`${displayFont.className} text-[1.45rem] font-semibold leading-none transition-colors duration-[var(--motion-duration-base)] ease-[var(--motion-ease-standard)] group-hover:text-[var(--accent)] motion-reduce:transition-none md:text-2xl`}>
          {title}
        </h3>
        {subtitle ? <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{subtitle}</p> : null}
        {meta ? <div className="mt-3">{meta}</div> : null}
      </div>
      <div className="flex min-w-0 flex-col justify-between gap-3 md:gap-4">
        <div className="hidden max-w-2xl text-sm leading-7 text-[var(--muted)] sm:block">{description}</div>
        {href ? (
          <div className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--accent)]">
            <span>{actionLabel}</span>
            <ArrowUpRight className="transition-transform duration-[var(--motion-duration-base)] ease-[var(--motion-ease-move)] group-hover:translate-x-1 motion-reduce:transition-none" size={16} />
          </div>
        ) : null}
      </div>
    </>
  );

  const opportunityContent = (
    <>
      <div className="grid min-w-0 grid-cols-[4.25rem_minmax(0,1fr)] gap-3 sm:grid-cols-[4.5rem_minmax(0,1fr)] sm:gap-4">
        {media ? <div className="sm:pt-1">{media}</div> : null}
        <div className="min-w-0">
          <div>{label}</div>
          {labelMeta ? <div className="mt-2 md:mt-3">{labelMeta}</div> : null}
          <div className="mt-3 md:mt-4">
            <h3 className={`${displayFont.className} text-[1.35rem] font-semibold leading-none transition-colors duration-[var(--motion-duration-base)] ease-[var(--motion-ease-standard)] group-hover:text-[var(--accent)] motion-reduce:transition-none md:text-[1.95rem]`}>
              {title}
            </h3>
            {subtitle ? (
              <p className="mt-2 text-[12px] font-semibold uppercase tracking-[0.12em] text-[var(--muted)]">{subtitle}</p>
            ) : null}
            {meta ? <div className="mt-4">{meta}</div> : null}
          </div>
        </div>
      </div>
      <div className="col-span-2 flex min-w-0 flex-col justify-between gap-3 pt-2 sm:col-span-1 sm:pt-3 lg:pl-4 lg:pt-0">
        <div className="hidden max-w-[34rem] text-sm leading-7 text-[var(--muted)] sm:block">{description}</div>
        {href ? (
          <div className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--accent)]">
            <span>{actionLabel}</span>
            <ArrowUpRight className="transition-transform duration-[var(--motion-duration-base)] ease-[var(--motion-ease-move)] group-hover:translate-x-1 motion-reduce:transition-none" size={16} />
          </div>
        ) : null}
      </div>
    </>
  );

  const directoryContent = (
    <>
      <div className="grid min-w-0 grid-cols-[3.75rem_minmax(0,1fr)] gap-3 md:grid-cols-[4.5rem_minmax(0,1fr)] md:gap-4">
        {media ? <div>{media}</div> : null}
        <div className="min-w-0">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex min-w-0 flex-wrap items-center gap-3">
              <div>{label}</div>
              {labelMeta ? <div>{labelMeta}</div> : null}
            </div>
            {href && variant !== 'directory' ? (
              <span className="inline-flex shrink-0 items-center gap-2 text-sm font-semibold text-[var(--accent)]">
                {actionLabel}
                <ArrowUpRight className="transition-transform duration-[var(--motion-duration-base)] ease-[var(--motion-ease-move)] group-hover:translate-x-1 motion-reduce:transition-none" size={16} />
              </span>
            ) : null}
          </div>
          <h3 className={`${displayFont.className} mt-2 text-[1.35rem] font-semibold leading-[1.05] transition-colors duration-[var(--motion-duration-base)] ease-[var(--motion-ease-standard)] group-hover:text-[var(--accent)] motion-reduce:transition-none md:mt-3 md:text-[1.9rem]`}>
            {title}
          </h3>
          {subtitle ? <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{subtitle}</p> : null}
          <div className="mt-3 hidden max-w-2xl text-sm leading-7 text-[var(--muted)] sm:block">{description}</div>
          {meta ? <div className="mt-4">{meta}</div> : null}
          {href ? (
            <div className="mt-5 flex justify-start md:justify-end">
              <span className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--accent)]">
                {actionLabel}
                <ArrowUpRight className="transition-transform duration-[var(--motion-duration-base)] ease-[var(--motion-ease-move)] group-hover:translate-x-1 motion-reduce:transition-none" size={16} />
              </span>
            </div>
          ) : null}
        </div>
      </div>
    </>
  );

  if (href) {
    return (
      <article
        className={cn(
          'public-list-row-shell md:px-4',
          className
        )}
        {...props}
      >
        <AppLink
          className={cn(
            'group grid gap-3 rounded-[var(--radius-xl)] py-4 transition-colors duration-[var(--motion-duration-base)] ease-[var(--motion-ease-standard)] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--accent)] focus-visible:ring-inset motion-reduce:transition-none md:gap-5 md:py-7',
            variant === 'default' && columns === 'default' && 'md:grid-cols-[0.24fr_0.5fr_0.7fr]',
            variant === 'default' && columns === 'content' && 'md:grid-cols-[0.26fr_0.52fr_0.72fr]',
            variant === 'default' && 'px-0',
            variant === 'opportunity' && 'px-4 lg:grid-cols-[minmax(0,1.08fr)_minmax(18rem,0.66fr)]',
            variant === 'directory' && 'px-0'
          )}
          href={href}
        >
          {variant === 'opportunity' ? opportunityContent : variant === 'directory' ? directoryContent : defaultContent}
        </AppLink>
      </article>
    );
  }

  return (
    <Component
      className={cn(
        'grid gap-5 border-b border-[var(--border-default)] py-6 md:py-7',
        variant === 'default' && columns === 'default' && 'md:grid-cols-[0.24fr_0.5fr_0.7fr]',
        variant === 'default' && columns === 'content' && 'md:grid-cols-[0.26fr_0.52fr_0.72fr]',
        variant === 'opportunity' && 'lg:grid-cols-[minmax(0,1.08fr)_minmax(18rem,0.66fr)]',
        variant === 'directory' && '',
        className
      )}
      {...props}
    >
      {variant === 'opportunity' ? opportunityContent : variant === 'directory' ? directoryContent : defaultContent}
    </Component>
  );
}
