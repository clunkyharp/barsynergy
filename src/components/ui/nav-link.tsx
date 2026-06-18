import type { AnchorHTMLAttributes } from 'react';
import { AppLink } from '@/components/ui/app-link';
import { cn } from '@/lib/utils';

export function NavLink({ className, ...props }: AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) {
  return (
    <AppLink
      className={cn(
        'rounded-[var(--radius-md)] px-3 py-2.5 font-semibold transition-colors duration-[var(--motion-duration-fast)] ease-[var(--motion-ease-standard)] motion-reduce:transition-none',
        className
      )}
      {...props}
    />
  );
}
