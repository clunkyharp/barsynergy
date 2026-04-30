import type { AnchorHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export function InlineLink({ className, ...props }: AnchorHTMLAttributes<HTMLAnchorElement>) {
  return <a className={cn('font-semibold text-[var(--accent)] underline-offset-4 hover:underline', className)} {...props} />;
}
