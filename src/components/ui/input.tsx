import type { InputHTMLAttributes } from 'react';
import { fieldBaseClassName } from '@/components/ui/field-styles';
import { cn } from '@/lib/utils';

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        fieldBaseClassName,
        'file:mr-4 file:rounded-full file:border-0 file:bg-[var(--graphite)] file:px-4 file:py-2 file:text-[11px] file:font-semibold file:uppercase file:tracking-[0.12em] file:text-white disabled:file:bg-black/50 hover:file:bg-black',
        className
      )}
      {...props}
    />
  );
}
