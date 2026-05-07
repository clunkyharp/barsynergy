import type { InputHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export function Checkbox({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        'checkbox-control',
        className
      )}
      type="checkbox"
      {...props}
    />
  );
}
