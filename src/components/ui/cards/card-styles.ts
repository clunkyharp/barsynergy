import { cn } from '@/lib/utils';

type CardStyleOptions = {
  hasHover?: boolean;
  isClickable?: boolean;
};

export function rootCardClass(className?: string, opts?: CardStyleOptions) {
  return cn(
    'flex flex-col overflow-hidden rounded-[var(--radius-xl)] border border-[var(--border-default)] bg-[var(--surface-card)]',
    opts?.hasHover && 'transition-shadow duration-[var(--motion-duration-base)] ease-[var(--motion-ease-standard)] hover:shadow-[var(--shadow-card)]',
    opts?.isClickable && 'cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)]',
    className
  );
}

export function cardEyebrowClass(isDark = false) {
  return `text-[11px] font-semibold uppercase tracking-[var(--tracking-eyebrow-md)] ${isDark ? 'text-[var(--editorial-dark-label)]' : 'text-[var(--accent-ink)]'}`;
}

export function cardTitleClass(density: 'comfortable' | 'compact' = 'comfortable') {
  return cn(
    'font-semibold leading-[1.2] text-[var(--text)]',
    density === 'comfortable' ? 'text-[1.1rem] md:text-[1.2rem]' : 'text-[0.95rem]'
  );
}

export function cardSummaryClass() {
  return 'mt-2 line-clamp-2 text-[13px] leading-5 text-[var(--muted)]';
}

export function cardMetaClass() {
  return 'mt-3';
}

export function cardFooterClass() {
  return 'mt-auto flex items-center justify-between gap-3 pt-4';
}

export function cardMinHeightClass(size: 'standard' | 'feature' = 'standard') {
  return size === 'feature' ? 'min-h-[420px]' : 'min-h-[360px]';
}
