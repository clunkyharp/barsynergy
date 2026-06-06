import { useId, type InputHTMLAttributes, type ReactNode } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';

type CheckboxFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  children: ReactNode;
  className?: string;
  labelClassName?: string;
};

export function CheckboxField({ children, className, labelClassName, disabled, id: idProp, ...props }: CheckboxFieldProps) {
  const generatedId = useId();
  const inputId = idProp ?? `${props.name ?? 'checkbox'}-${generatedId.replace(/:/g, '')}`;

  return (
    <div className={cn('checkbox-field', disabled && 'opacity-70', className)}>
      <Checkbox disabled={disabled} id={inputId} {...props} />
      <label className={cn('checkbox-field-label min-w-0', labelClassName)} htmlFor={inputId}>
        {children}
      </label>
    </div>
  );
}
