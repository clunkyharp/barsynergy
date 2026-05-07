'use client';

import { forwardRef, useState, type ChangeEvent, type InputHTMLAttributes } from 'react';
import { fieldBaseClassName } from '@/components/ui/field-styles';
import { cn } from '@/lib/utils';

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(function Input(
  { className, defaultValue, onChange, value, ...props },
  ref
) {
  const [localValue, setLocalValue] = useState(defaultValue ?? '');
  const currentValue = value ?? localValue;
  const isFileInput = props.type === 'file';
  const isFilled = !isFileInput && String(currentValue ?? '').length > 0;

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    if (value === undefined) {
      setLocalValue(event.currentTarget.value);
    }

    onChange?.(event);
  }

  return (
    <input
      className={cn(
        fieldBaseClassName,
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

export const TextInput = Input;
