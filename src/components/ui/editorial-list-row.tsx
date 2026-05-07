import type { HTMLAttributes, ReactNode } from 'react';
import { ArrowUpRight } from 'lucide-react';
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
        <h3 className={`${displayFont.className} text-[1.45rem] font-semibold leading-none transition-colors duration-300 group-hover:text-[var(--accent)] md:text-2xl`}>
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
            <ArrowUpRight className="transition-transform duration-300 group-hover:translate-x-1" size={16} />
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
            <h3 className={`${displayFont.className} text-[1.35rem] font-semibold leading-none transition-colors duration-300 group-hover:text-[var(--accent)] md:text-[1.95rem]`}>
              {title}
            </h3>
            {subtitle ? (
              <p className="mt-2 text-[12px] font-semibold uppercase tracking-[0.12em] text-[var(--muted)]">{subtitle}</p>
            ) : null}
            {meta ? <div className="mt-4">{meta}</div> : null}
          </div>
        </div>
      </div>
      <div className="col-span-2 flex min-w-0 flex-col justify-between gap-3 border-t border-[var(--border-default)] pt-3 sm:col-span-1 sm:pt-4 lg:border-l lg:border-t-0 lg:pl-7 lg:pt-0">
        <div className="hidden max-w-[34rem] text-sm leading-7 text-[var(--muted)] sm:block">{description}</div>
        {href ? (
          <div className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--accent)]">
            <span>{actionLabel}</span>
            <ArrowUpRight className="transition-transform duration-300 group-hover:translate-x-1" size={16} />
          </div>
        ) : null}
      </div>
    </>
  );

  const directoryContent = (
    <>
      <div className="grid min-w-0 grid-cols-[4.25rem_minmax(0,1fr)] gap-3 md:grid-cols-[8rem_minmax(0,1fr)] md:gap-4">
        {media ? <div>{media}</div> : null}
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-3">
            <div>{label}</div>
            {labelMeta ? <div>{labelMeta}</div> : null}
          </div>
          <h3 className={`${displayFont.className} mt-2 text-[1.35rem] font-semibold leading-none transition-colors duration-300 group-hover:text-[var(--accent)] md:mt-3 md:text-[2rem]`}>
            {title}
          </h3>
          {subtitle ? <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{subtitle}</p> : null}
          <div className="mt-3 hidden max-w-2xl text-sm leading-7 text-[var(--muted)] sm:block">{description}</div>
          {meta ? <div className="mt-4">{meta}</div> : null}
        </div>
      </div>
      {href ? (
        <div className="col-span-2 grid min-w-0 grid-cols-2 gap-2 border-t border-[var(--border-default)] pt-3 lg:col-span-1 lg:flex lg:flex-col lg:justify-center lg:gap-3 lg:border-l lg:border-t-0 lg:pl-6 lg:pt-0">
          <span className="inline-flex min-h-11 items-center justify-center gap-2 whitespace-nowrap rounded-[var(--radius-md)] border border-[var(--accent)]/38 px-5 text-sm font-semibold text-[var(--accent)] transition-colors group-hover:border-[var(--accent)] group-hover:bg-[var(--accent)] group-hover:text-white">
            {actionLabel}
            <ArrowUpRight className="transition-transform duration-300 group-hover:translate-x-1" size={16} />
          </span>
          <span className="inline-flex min-h-11 items-center justify-center whitespace-nowrap rounded-[var(--radius-md)] border border-[var(--border-default)] px-5 text-sm font-semibold text-[var(--muted)]">
            Контакты внутри
          </span>
        </div>
      ) : null}
    </>
  );

  if (href) {
    return (
      <article
        className={cn(
            variant === 'opportunity'
              ? 'bg-transparent transition-[border-color,background-color,box-shadow] duration-300 md:rounded-[var(--radius-lg)] md:border md:border-[var(--border-default)] md:bg-[color-mix(in_oklab,var(--surface),white_20%)] md:px-4 md:shadow-[0_12px_34px_rgba(20,20,18,0.035)] md:hover:border-[var(--accent)]/24 md:hover:bg-[color-mix(in_oklab,var(--surface),white_24%)] md:hover:shadow-[0_16px_38px_rgba(20,20,18,0.045)]'
              : variant === 'directory'
                ? 'bg-transparent transition-[border-color,background-color,box-shadow] duration-300 md:rounded-[var(--radius-lg)] md:border md:border-[var(--border-default)] md:bg-[color-mix(in_oklab,var(--surface),white_22%)] md:px-4 md:shadow-[0_12px_34px_rgba(20,20,18,0.03)] md:hover:border-[var(--accent)]/24 md:hover:bg-[color-mix(in_oklab,var(--surface),white_28%)] md:hover:shadow-[0_16px_38px_rgba(20,20,18,0.04)]'
            : 'bg-transparent transition-[border-color,background-color,box-shadow] duration-300 md:rounded-[var(--radius-lg)] md:border md:border-[var(--border-default)] md:bg-[color-mix(in_oklab,var(--surface),white_18%)] md:px-4 md:shadow-[0_12px_34px_rgba(20,20,18,0.03)] md:hover:border-[var(--accent)]/24 md:hover:bg-[color-mix(in_oklab,var(--surface),white_24%)] md:hover:shadow-[0_16px_38px_rgba(20,20,18,0.04)]',
          className
        )}
        {...props}
      >
        <a
          className={cn(
            'group grid gap-3 rounded-[var(--radius-xl)] py-4 transition-colors duration-300 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--accent)] focus-visible:ring-inset md:gap-5 md:py-7',
            variant === 'default' && columns === 'default' && 'md:grid-cols-[0.24fr_0.5fr_0.7fr]',
            variant === 'default' && columns === 'content' && 'md:grid-cols-[0.26fr_0.52fr_0.72fr]',
            variant === 'default' && 'px-0',
            variant === 'opportunity' && 'px-4 lg:grid-cols-[minmax(0,1.08fr)_minmax(18rem,0.66fr)]',
            variant === 'directory' && 'px-0 lg:grid-cols-[minmax(0,1fr)_minmax(13.5rem,0.28fr)]'
          )}
          href={href}
        >
          {variant === 'opportunity' ? opportunityContent : variant === 'directory' ? directoryContent : defaultContent}
        </a>
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
        variant === 'directory' && 'lg:grid-cols-[minmax(0,1fr)_minmax(13.5rem,0.28fr)]',
        className
      )}
      {...props}
    >
      {variant === 'opportunity' ? opportunityContent : variant === 'directory' ? directoryContent : defaultContent}
    </Component>
  );
}
