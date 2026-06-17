import type { HTMLAttributes } from 'react';
import { AppLink } from '@/components/ui/app-link';
import { displayFont } from '@/lib/fonts';
import { cn } from '@/lib/utils';

type PublicEyebrowTone = 'accent' | 'muted' | 'inverse';
type PublicDisplayTitleSize = 'hero' | 'section' | 'card' | 'card-compact' | 'legal' | 'compact';
type PublicBodyTone = 'default' | 'muted' | 'inverse';
type PublicBodySize = 'sm' | 'md';

type PublicBreadcrumbItem = {
  href?: string;
  label: string;
};

export function PublicBreadcrumbs({
  className,
  items,
  current
}: {
  className?: string;
  items?: PublicBreadcrumbItem[];
  current: string;
}) {
  const resolvedItems = items ?? [{ href: '/', label: 'Главная' }];

  return (
    <nav aria-label="Хлебные крошки" className={cn('text-xs leading-5 text-[var(--muted)] md:text-sm md:leading-6', className)}>
      <ol className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
        {resolvedItems.map((item, index) => (
          <li className="inline-flex min-w-0 items-center gap-2" key={`${item.label}-${item.href ?? index}`}>
            {item.href ? (
              <AppLink className="muted-link truncate" href={item.href}>
                {item.label}
              </AppLink>
            ) : (
              <span className="truncate">{item.label}</span>
            )}
            <span aria-hidden="true" className="text-[var(--muted)]">
              ›
            </span>
          </li>
        ))}
        <li aria-current="page" className="min-w-0 truncate">
          {current}
        </li>
      </ol>
    </nav>
  );
}

export function PublicEyebrow({
  className,
  tone = 'accent',
  ...props
}: HTMLAttributes<HTMLParagraphElement> & {
  tone?: PublicEyebrowTone;
}) {
  return (
    <p
      className={cn(
        'text-[11px] font-bold uppercase tracking-[var(--tracking-eyebrow-md)]',
        tone === 'accent' && 'text-[var(--accent)]',
        tone === 'muted' && 'text-[var(--muted)]',
        tone === 'inverse' && 'text-[var(--editorial-dark-label)]',
        className
      )}
      {...props}
    />
  );
}

export function PublicDisplayTitle({
  as = 'h2',
  className,
  size = 'section',
  ...props
}: HTMLAttributes<HTMLHeadingElement> & {
  as?: 'h1' | 'h2' | 'h3';
  size?: PublicDisplayTitleSize;
}) {
  const Component = as;

  return (
    <Component
      className={cn(
        displayFont.className,
        'display-tight font-semibold text-[var(--text)]',
        size === 'hero' && 'max-w-6xl text-[clamp(3.1rem,6.2vw,6.85rem)]',
        size === 'section' && 'text-[44px] md:text-[64px]',
        size === 'card' && 'text-[32px] md:text-[42px]',
        size === 'card-compact' && 'text-[22px] md:text-[42px]',
        size === 'legal' && 'max-w-3xl break-words text-[34px] sm:text-[42px] md:text-[50px]',
        size === 'compact' && 'text-[clamp(2.1rem,3.6vw,3.2rem)]',
        className
      )}
      {...props}
    />
  );
}

export function PublicBodyText({
  className,
  size = 'sm',
  tone = 'muted',
  ...props
}: HTMLAttributes<HTMLParagraphElement> & {
  size?: PublicBodySize;
  tone?: PublicBodyTone;
}) {
  return (
    <p
      className={cn(
        size === 'md' ? 'text-base leading-7' : 'text-sm leading-7',
        tone === 'default' && 'text-[var(--text)]',
        tone === 'muted' && 'text-[var(--muted)]',
        tone === 'inverse' && 'text-white/85',
        className
      )}
      {...props}
    />
  );
}

export function PublicActionRow({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('mt-8 flex flex-wrap gap-4', className)} {...props} />;
}
