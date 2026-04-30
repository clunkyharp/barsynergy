import type { AnchorHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

type NavLinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  active?: boolean;
};

export function NavLink({ className, active = false, ...props }: NavLinkProps) {
  return (
    <a
      className={cn(
        'rounded-2xl px-3 py-2.5 font-semibold transition hover:bg-[var(--surface-muted)]',
        active ? 'bg-[var(--graphite)] text-white hover:bg-[var(--graphite)]' : 'text-[var(--text)]',
        className
      )}
      {...props}
    />
  );
}
