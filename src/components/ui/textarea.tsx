import type { TextareaHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export function Textarea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        'min-h-28 w-full resize-none rounded-md border border-[var(--line)] bg-white px-3 py-2 text-sm outline-none transition hover:border-black/35 focus:border-[var(--accent)] disabled:cursor-not-allowed disabled:bg-[var(--surface-muted)] disabled:text-[var(--muted)] disabled:opacity-70 aria-[invalid=true]:border-[var(--danger)] aria-[invalid=true]:bg-white',
        className
      )}
      {...props}
    />
  );
}
