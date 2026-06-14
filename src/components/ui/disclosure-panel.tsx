import type { DetailsHTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/utils';

type DisclosurePanelProps = DetailsHTMLAttributes<HTMLDetailsElement> & {
  bodyClassName?: string;
  children: ReactNode;
  closeLabel?: string;
  description?: string;
  openLabel?: string;
  summaryClassName?: string;
  title: string;
};

export function DisclosurePanel({
  bodyClassName,
  children,
  className,
  closeLabel = 'Свернуть',
  description,
  openLabel = 'Открыть',
  summaryClassName,
  title,
  ...props
}: DisclosurePanelProps) {
  return (
    <details className={cn('group/disclosure-panel overflow-hidden', className)} {...props}>
      <summary
        className={cn(
          'grid cursor-pointer list-none gap-3 transition-colors [&::-webkit-details-marker]:hidden',
          summaryClassName
        )}
      >
        <span className="min-w-0">
          <span className="block text-lg font-semibold tracking-normal text-[var(--text)]">{title}</span>
          {description ? <span className="mt-1 block text-sm leading-6 text-[var(--muted)]">{description}</span> : null}
        </span>
        <span className="inline-flex min-h-10 w-fit items-center justify-center rounded-[var(--radius-sm)] border border-[var(--line)] px-4 text-sm font-semibold text-[var(--text)] transition-colors group-open/disclosure-panel:text-[var(--muted)]">
          <span className="group-open/disclosure-panel:hidden">{openLabel}</span>
          <span className="hidden group-open/disclosure-panel:inline">{closeLabel}</span>
        </span>
      </summary>
      <div className={bodyClassName}>{children}</div>
    </details>
  );
}
