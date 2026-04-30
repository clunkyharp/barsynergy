import type { InputHTMLAttributes, ReactNode } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';

type CheckboxFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  children: ReactNode;
  className?: string;
  labelClassName?: string;
};

export function CheckboxField({ children, className, labelClassName, disabled, ...props }: CheckboxFieldProps) {
  return (
    <label className={cn('flex items-start gap-3 text-sm leading-6 text-[var(--muted)]', disabled && 'opacity-70', className)}>
      <Checkbox className="mt-[0.2rem]" disabled={disabled} {...props} />
      <span className={cn('min-w-0', labelClassName)}>{children}</span>
    </label>
  );
}
