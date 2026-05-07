import type { InputHTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/utils';

type RadioFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  children: ReactNode;
  className?: string;
  labelClassName?: string;
};

export function RadioField({ children, className, labelClassName, disabled, ...props }: RadioFieldProps) {
  return (
    <label className={cn('radio-field', disabled && 'opacity-70', className)}>
      <input className="radio-control" disabled={disabled} type="radio" {...props} />
      <span className={cn('min-w-0', labelClassName)}>{children}</span>
    </label>
  );
}

type RadioGroupProps = {
  children: ReactNode;
  className?: string;
  description?: string;
  legend: string;
};

export function RadioGroup({ children, className, description, legend }: RadioGroupProps) {
  return (
    <fieldset className={cn('form-choice-group', className)}>
      <legend className="field-label">{legend}</legend>
      {description ? <p className="field-hint mt-2">{description}</p> : null}
      <div className="mt-4 grid gap-3">{children}</div>
    </fieldset>
  );
}
