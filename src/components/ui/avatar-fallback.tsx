import type { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

type AvatarFallbackSize = 'sm' | 'md';

const sizeClasses: Record<AvatarFallbackSize, string> = {
  sm: 'size-10 text-xs',
  md: 'size-12 text-sm sm:size-14 md:size-16'
};

type AvatarFallbackProps = HTMLAttributes<HTMLSpanElement> & {
  initials: string;
  size?: AvatarFallbackSize;
};

export function AvatarFallback({ className, initials, size = 'md', ...props }: AvatarFallbackProps) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        'grid shrink-0 place-items-center rounded-[var(--radius-md)] bg-[var(--accent-soft)] font-bold uppercase tracking-[var(--tracking-eyebrow-sm)] text-[var(--accent)]',
        sizeClasses[size],
        className
      )}
      {...props}
    >
      {initials}
    </span>
  );
}
