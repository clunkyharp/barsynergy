import type { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export function EditorialShell({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('editorial-form-shell', className)} {...props} />;
}
