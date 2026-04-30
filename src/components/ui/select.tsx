import type { SelectHTMLAttributes } from 'react';
import { fieldBaseClassName } from '@/components/ui/field-styles';
import { cn } from '@/lib/utils';

export function Select({ className, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={cn(
        fieldBaseClassName,
        'cursor-pointer appearance-auto pr-10 hover:border-[rgba(22,19,15,0.34)] hover:bg-white focus:border-[var(--graphite)]',
        className
      )}
      {...props}
    />
  );
}
