import type { InputHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export function Checkbox({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        'mt-px h-5 w-5 shrink-0 rounded-[0.4rem] border border-black/20 bg-white accent-[var(--graphite)] shadow-[inset_0_1px_0_rgba(255,255,255,0.82)] transition hover:border-black/40 focus-visible:!outline-none focus-visible:ring-0 focus-visible:shadow-[0_0_0_3px_rgba(20,20,18,0.12)] disabled:cursor-not-allowed disabled:border-black/10 disabled:bg-[var(--surface-muted)] disabled:opacity-55 aria-[invalid=true]:outline aria-[invalid=true]:outline-2 aria-[invalid=true]:outline-[var(--danger)]',
        className
      )}
      type="checkbox"
      {...props}
    />
  );
}
