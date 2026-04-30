import type { AnchorHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

type EditorialActionProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  tone?: 'default' | 'inverse';
};

export function EditorialAction({ className, tone = 'default', ...props }: EditorialActionProps) {
  return (
    <a
      className={cn(
        'editorial-link inline-flex min-h-11 items-center justify-center gap-2 rounded-[var(--radius-pill)] border px-5 py-2.5 text-sm font-semibold uppercase tracking-[0.08em] transition',
        tone === 'default' && 'border-[var(--border-default)] text-[var(--text)]',
        tone === 'inverse' && 'border-[var(--border-inverse)] text-white',
        className
      )}
      {...props}
    />
  );
}
