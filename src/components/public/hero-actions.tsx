'use client';

import { ArrowUpRight } from 'lucide-react';
import { cn } from '@/lib/utils';

type HeroActionsProps = {
  primaryLabel: string;
  onPrimaryClick: () => void;
  secondaryLabel?: string;
  onSecondaryClick?: () => void;
  className?: string;
};

export function HeroActions({
  primaryLabel,
  onPrimaryClick,
  secondaryLabel,
  onSecondaryClick,
  className
}: HeroActionsProps) {
  return (
    <div className={cn('mt-6 flex flex-wrap items-center gap-3', className)}>
      <button
        className="inline-flex h-12 items-center justify-center gap-2 whitespace-nowrap rounded-[var(--radius-md)] border border-[var(--accent)] bg-[var(--accent)] px-6 text-[15px] font-semibold leading-5 text-[var(--accent-contrast)] transition-[background-color,border-color,color,box-shadow,filter,transform] duration-[var(--motion-duration-fast)] ease-[var(--motion-ease-standard)] active:scale-[0.98] hover:border-[var(--accent-strong)] hover:bg-[var(--accent-strong)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)] motion-reduce:transition-none motion-reduce:active:scale-100"
        onClick={onPrimaryClick}
        type="button"
      >
        {primaryLabel}
        <ArrowUpRight size={16} />
      </button>
      {secondaryLabel && onSecondaryClick ? (
        <button
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--muted)] transition-colors duration-[var(--motion-duration-fast)] hover:text-[var(--accent)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] motion-reduce:transition-none"
          onClick={onSecondaryClick}
          type="button"
        >
          {secondaryLabel}
          <ArrowUpRight size={15} strokeWidth={1.8} />
        </button>
      ) : null}
    </div>
  );
}
