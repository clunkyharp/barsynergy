import type { InputHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export function Checkbox({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        'h-4 w-4 rounded border-[var(--line)] accent-[var(--accent)] transition disabled:cursor-not-allowed disabled:opacity-50 aria-[invalid=true]:outline aria-[invalid=true]:outline-2 aria-[invalid=true]:outline-[var(--danger)]',
        className
      )}
      type="checkbox"
      {...props}
    />
  );
}
