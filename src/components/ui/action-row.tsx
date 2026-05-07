import type { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

type ActionRowProps = HTMLAttributes<HTMLDivElement> & {
  align?: 'start' | 'between';
};

export function ActionRow({ className, align = 'start', ...props }: ActionRowProps) {
  return (
    <div
      className={cn(
        'form-actions',
        align === 'between' && 'sm:justify-between',
        className
      )}
      {...props}
    />
  );
}
