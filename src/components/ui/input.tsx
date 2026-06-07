'use client';

import { forwardRef, useCallback, useEffect, useRef, type InputHTMLAttributes } from 'react';
import { fieldBaseClassName } from '@/components/ui/field-styles';
import { cn } from '@/lib/utils';

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(function Input(
  { className, defaultValue, onChange, value, ...props },
  ref
) {
  const innerRef = useRef<HTMLInputElement>(null);
  const isFileInput = props.type === 'file';
  const isControlled = value !== undefined;

  // For controlled inputs React manages data-filled via prop re-renders.
  // For uncontrolled inputs we update data-filled directly on the DOM node so
  // React reconciliation never fights with browser autofill (including Chrome's
  // password generator which sets node.value without going through React state).
  const isFilled = isControlled && !isFileInput && String(value ?? '').length > 0;

  useEffect(() => {
    if (isControlled || isFileInput) return;
    const el = innerRef.current;
    if (!el) return;

    function sync() {
      if (!el) return;
      if (el.value.length > 0) {
        el.dataset.filled = 'true';
      } else {
        delete el.dataset.filled;
      }
    }

    sync();
    el.addEventListener('input', sync);
    el.addEventListener('change', sync);
    // Chrome fires animationstart on :-webkit-autofill; catch it too
    el.addEventListener('animationstart', sync);
    return () => {
      el.removeEventListener('input', sync);
      el.removeEventListener('change', sync);
      el.removeEventListener('animationstart', sync);
    };
  }, [isControlled, isFileInput]);

  const mergedRef = useCallback(
    (node: HTMLInputElement | null) => {
      innerRef.current = node;
      if (typeof ref === 'function') ref(node);
      else if (ref) ref.current = node;
    },
    [ref]
  );

  return (
    <input
      className={cn(fieldBaseClassName, className)}
      data-filled={isFilled || undefined}
      defaultValue={defaultValue}
      onChange={onChange}
      ref={mergedRef}
      value={value}
      {...props}
    />
  );
});

export const TextInput = Input;
