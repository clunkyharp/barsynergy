import type { ReactNode } from 'react';
import { CheckboxField } from '@/components/ui/checkbox-field';
import { consentFieldClassName } from '@/components/ui/field-styles';
import { cn } from '@/lib/utils';

type ConsentFieldProps = {
  children: ReactNode;
  className?: string;
  density?: 'default' | 'compact';
  disabled?: boolean;
  name?: string;
  required?: boolean;
  value?: string;
};

export function ConsentField({
  children,
  className,
  density = 'default',
  disabled = false,
  name = 'consent',
  required = true,
  value = 'accepted'
}: ConsentFieldProps) {
  return (
    <CheckboxField
      className={cn(
        consentFieldClassName,
        density === 'compact' && 'text-xs leading-5',
        className
      )}
      disabled={disabled}
      labelClassName="min-w-0"
      name={name}
      required={required}
      value={value}
    >
      {children}
    </CheckboxField>
  );
}
