import type { AnchorHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

type NavLinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  active?: boolean;
};

export function NavLink({ className, active = false, ...props }: NavLinkProps) {
  return (
    <a
      className={cn(
        'rounded-[var(--radius-md)] px-3 py-2.5 font-semibold transition hover:bg-[var(--surface-muted)]',
        active ? 'bg-[var(--accent)] text-[var(--accent-contrast)] hover:bg-[var(--accent-strong)]' : 'text-[var(--text)]',
        className
      )}
      {...props}
    />
  );
}
