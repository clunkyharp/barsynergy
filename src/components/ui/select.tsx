import type { SelectHTMLAttributes } from 'react';
import { fieldBaseClassName } from '@/components/ui/field-styles';
import { cn } from '@/lib/utils';

export function Select({ className, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={cn(
        fieldBaseClassName,
        'cursor-pointer appearance-auto pr-10 hover:border-[var(--accent)]/35 hover:bg-[var(--field-bg-hover)] focus:border-[var(--accent)]',
        className
      )}
      {...props}
    />
  );
}
