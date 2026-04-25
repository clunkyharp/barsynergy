import type { InputHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        'min-h-11 w-full rounded-md border border-[var(--line)] bg-white px-3 text-sm outline-none transition focus:border-[var(--accent)]',
        className
      )}
      {...props}
    />
  );
}
