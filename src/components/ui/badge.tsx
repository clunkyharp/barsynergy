import type { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export function Badge({ className, ...props }: HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border border-[var(--line)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.08em] text-[var(--muted)]',
        className
      )}
      {...props}
    />
  );
}
