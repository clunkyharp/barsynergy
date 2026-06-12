import type { HTMLAttributes, ReactNode } from 'react';
import { ArrowUpRight, BadgeCheck } from 'lucide-react';
import { AppLink } from '@/components/ui/app-link';
import { Button, type ButtonVariant } from '@/components/ui/button';
import { displayFont } from '@/lib/fonts';
import { cn } from '@/lib/utils';

type RowAction = {
  href: string;
  label: string;
  variant?: ButtonVariant;
};

type EditorialListRowProps = HTMLAttributes<HTMLElement> & {
  label: ReactNode;
  title: ReactNode;
  description: ReactNode;
  actions?: RowAction[];
  lead?: ReactNode;
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
  actions,
  className,
  columns = 'default',
  description,
  label,
  labelMeta,
  lead,
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

  const compactCardContent = (
    <>
      <div className="min-w-0">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2.5">
            <div>{label}</div>
            {labelMeta ? <div>{labelMeta}</div> : null}
          </div>
          {href ? (
            <AppLink className="group/title mt-3 block w-fit max-w-full rounded-[var(--radius-sm)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--accent)]" href={href}>
              <h3 className="public-list-row-title text-balance text-[1.85rem] font-bold leading-[1.08] text-[var(--text)] transition-colors duration-[var(--motion-duration-base)] ease-[var(--motion-ease-standard)] group-hover/title:text-[var(--accent)] motion-reduce:transition-none md:text-[2.2rem]">
                {title}
              </h3>
            </AppLink>
          ) : (
            <h3 className="public-list-row-title mt-3 text-balance text-[1.35rem] font-bold leading-[1.15] text-[var(--text)] md:text-[1.55rem]">{title}</h3>
          )}
          {lead ? <div className="public-list-row-lead mt-3 text-[1.25rem] font-semibold leading-8 text-[var(--text)] md:text-[1.45rem]">{lead}</div> : null}
          {meta ? <div className="public-list-row-meta mt-4">{meta}</div> : null}
        </div>
      </div>
      <div className="public-list-row-company min-w-0">
        <div className="grid gap-3 sm:grid-cols-[4rem_minmax(0,1fr)] sm:items-start">
          {media ? <div className="hidden sm:block">{media}</div> : null}
          <div className="min-w-0">
            {subtitle ? (
              <div className="flex min-w-0 flex-wrap items-center gap-2 text-[1.05rem] font-semibold leading-7 text-[var(--text)]">
                <span className="min-w-0 break-words">{subtitle}</span>
                <BadgeCheck aria-label="Проверено" className="shrink-0 text-[var(--accent)]" size={18} strokeWidth={2.2} />
              </div>
            ) : null}
            <div className={cn('text-[15px] leading-7 text-[var(--muted)]', subtitle ? 'mt-3' : '')}>{description}</div>
          </div>
        </div>
      </div>
      {actions && actions.length > 0 ? (
        <div className="public-list-row-actions flex flex-col gap-2.5 sm:flex-row sm:flex-wrap">
          {actions.map((action, index) => (
            <Button
              className={cn(
                'rounded-[var(--radius-md)] px-5 tracking-normal max-sm:w-full',
                index === 0 ? 'public-list-row-primary-action' : 'public-list-row-secondary-action'
              )}
              href={action.href}
              key={`${action.href}-${action.label}`}
              size="lg"
              variant={action.variant ?? (index === 0 ? 'primary' : 'secondary')}
            >
              {action.label}
            </Button>
          ))}
        </div>
      ) : null}
    </>
  );

  if (variant === 'opportunity' || variant === 'directory') {
    return (
      <article
        className={cn(
          'public-list-row-shell public-list-row-shell-hh',
          variant === 'opportunity' ? 'public-list-row-shell-vacancy' : 'public-list-row-shell-supplier',
          className
        )}
        {...props}
      >
        <div className="grid min-w-0 gap-6">
          {compactCardContent}
        </div>
      </article>
    );
  }

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
            'px-0'
          )}
          href={href}
        >
          {defaultContent}
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
        className
      )}
      {...props}
    >
      {defaultContent}
    </Component>
  );
}
