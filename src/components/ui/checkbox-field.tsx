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
    <label className={cn('checkbox-field', disabled && 'opacity-70', className)}>
      <Checkbox disabled={disabled} {...props} />
      <span className={cn('min-w-0', labelClassName)}>{children}</span>
    </label>
  );
}
