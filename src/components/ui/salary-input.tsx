'use client';

import { useLayoutEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import { fieldBaseClassName } from '@/components/ui/field-styles';

const salaryFormatter = new Intl.NumberFormat('ru-RU');

function formatDigits(digits: string): string {
  if (!digits) return '';
  const n = parseInt(digits, 10);
  return isNaN(n) ? '' : salaryFormatter.format(n);
}

// How many digit characters appear before position `pos` in `str`
function digitsBeforePos(str: string, pos: number): number {
  let count = 0;
  for (let i = 0; i < pos && i < str.length; i++) {
    if (/\d/.test(str[i])) count++;
  }
  return count;
}

// Position right after the Nth digit in `str`
function posAfterNthDigit(str: string, n: number): number {
  let count = 0;
  for (let i = 0; i < str.length; i++) {
    if (/\d/.test(str[i]) && ++count === n) return i + 1;
  }
  return str.length;
}

type SalaryInputProps = {
  className?: string;
  defaultValue?: number | null;
  id: string;
  name: string;
  placeholder?: string;
};

export function SalaryInput({ className, defaultValue, id, name, placeholder }: SalaryInputProps) {
  const [raw, setRaw] = useState(defaultValue != null ? String(defaultValue) : '');
  const inputRef = useRef<HTMLInputElement>(null);
  const pendingCursor = useRef<number | null>(null);

  const formatted = formatDigits(raw);

  // Restore cursor after each render where we tracked a pending position
  useLayoutEffect(() => {
    if (pendingCursor.current !== null && inputRef.current) {
      inputRef.current.setSelectionRange(pendingCursor.current, pendingCursor.current);
      pendingCursor.current = null;
    }
  });

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const cursorPos = e.target.selectionStart ?? e.target.value.length;
    const digitsBeforeCursor = digitsBeforePos(e.target.value, cursorPos);
    const newDigits = e.target.value.replace(/\D/g, '');
    const newFormatted = formatDigits(newDigits);
    pendingCursor.current = posAfterNthDigit(newFormatted, digitsBeforeCursor);
    setRaw(newDigits);
  }

  return (
    <>
      <input
        autoComplete="off"
        className={cn(fieldBaseClassName, className)}
        data-filled={formatted.length > 0 || undefined}
        id={id}
        inputMode="numeric"
        onChange={handleChange}
        placeholder={placeholder}
        ref={inputRef}
        type="text"
        value={formatted}
      />
      <input name={name} type="hidden" value={raw} />
    </>
  );
}
