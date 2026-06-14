import type { AnchorHTMLAttributes } from 'react';
import { AppLink } from '@/components/ui/app-link';
import { cn } from '@/lib/utils';

type EditorialActionProps = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> & {
  href: string;
  tone?: 'default' | 'inverse';
};

export function EditorialAction({ className, tone = 'default', ...props }: EditorialActionProps) {
  return (
    <AppLink
      className={cn(
        'editorial-link inline-flex min-h-11 items-center justify-center gap-2 rounded-[var(--radius-pill)] border px-5 py-2.5 text-sm font-semibold uppercase tracking-[var(--tracking-eyebrow-sm)] transition',
        tone === 'default' && 'border-[var(--border-default)] text-[var(--text)]',
        tone === 'inverse' && 'border-[var(--border-inverse)] text-white',
        className
      )}
      {...props}
    />
  );
}
