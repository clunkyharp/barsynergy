import type { AnchorHTMLAttributes } from 'react';
import { AppLink } from '@/components/ui/app-link';
import { cn } from '@/lib/utils';

type NavLinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  active?: boolean;
  href: string;
};

export function NavLink({ className, active = false, ...props }: NavLinkProps) {
  return (
    <AppLink
      className={cn(
        'rounded-[var(--radius-md)] px-3 py-2.5 font-semibold transition-colors duration-[var(--motion-duration-fast)] ease-[var(--motion-ease-standard)] hover:bg-[var(--surface-muted)] motion-reduce:transition-none',
        active ? 'bg-[var(--accent)] text-[var(--accent-contrast)] hover:bg-[var(--accent-strong)]' : 'text-[var(--text)]',
        className
      )}
      {...props}
    />
  );
}
