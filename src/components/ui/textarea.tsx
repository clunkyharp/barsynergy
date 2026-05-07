'use client';

import { forwardRef, useState, type ChangeEvent, type TextareaHTMLAttributes } from 'react';
import { textareaFieldClassName } from '@/components/ui/field-styles';
import { cn } from '@/lib/utils';

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(function Textarea(
  { className, defaultValue, onChange, value, ...props },
  ref
) {
  const [localValue, setLocalValue] = useState(defaultValue ?? '');
  const currentValue = value ?? localValue;
  const isFilled = String(currentValue ?? '').length > 0;

  function handleChange(event: ChangeEvent<HTMLTextAreaElement>) {
    if (value === undefined) {
      setLocalValue(event.currentTarget.value);
    }

    onChange?.(event);
  }

  return (
    <textarea
      className={cn(
        textareaFieldClassName,
        className
      )}
      data-filled={isFilled || undefined}
      defaultValue={defaultValue}
      onChange={handleChange}
      ref={ref}
      value={value}
      {...props}
    />
  );
});
