import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

type OutlinedPillProps = {
  children: ReactNode;
  className?: string;
  as?: 'span' | 'a';
  href?: string;
};

export function OutlinedPill({ children, className, as = 'span', href }: OutlinedPillProps) {
  const Component = as;

  return (
    <Component
      className={cn(
        'inline-flex items-center rounded-full border border-current bg-transparent px-3 py-1 text-[11px] font-semibold uppercase tracking-[var(--tracking-eyebrow-sm)] text-white/90 backdrop-blur-[2px]',
        className
      )}
      href={href}
    >
      {children}
    </Component>
  );
}
