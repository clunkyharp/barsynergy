'use client';

import { forwardRef, useCallback, useEffect, useRef, type TextareaHTMLAttributes } from 'react';
import { textareaFieldClassName } from '@/components/ui/field-styles';
import { cn } from '@/lib/utils';

function autoResize(el: HTMLTextAreaElement) {
  el.style.height = 'auto';
  el.style.height = `${el.scrollHeight}px`;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(function Textarea(
  { className, defaultValue, onChange, value, ...props },
  ref
) {
  const innerRef = useRef<HTMLTextAreaElement>(null);
  const isControlled = value !== undefined;
  const isFilled = isControlled && String(value ?? '').length > 0;

  useEffect(() => {
    const el = innerRef.current;
    if (!el) return;

    function sync() {
      if (!el) return;
      if (el.value.length > 0) {
        el.dataset.filled = 'true';
      } else {
        delete el.dataset.filled;
      }
      if (!isControlled) autoResize(el);
    }

    sync();
    el.addEventListener('input', sync);
    el.addEventListener('change', sync);
    return () => {
      el.removeEventListener('input', sync);
      el.removeEventListener('change', sync);
    };
  }, [isControlled]);

  useEffect(() => {
    if (!isControlled) return;
    const el = innerRef.current;
    if (!el) return;
    autoResize(el);
  }, [isControlled, value]);

  const mergedRef = useCallback(
    (node: HTMLTextAreaElement | null) => {
      innerRef.current = node;
      if (typeof ref === 'function') ref(node);
      else if (ref) ref.current = node;
    },
    [ref]
  );

  return (
    <textarea
      className={cn(textareaFieldClassName, className)}
      data-filled={isFilled || undefined}
      defaultValue={defaultValue}
      onChange={onChange}
      ref={mergedRef}
      value={value}
      {...props}
    />
  );
});
