'use client';

import { forwardRef, useState, type InputHTMLAttributes } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

export const PasswordInput = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(function PasswordInput(
  { className, ...props },
  ref
) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative">
      <Input ref={ref} className={cn('pr-10', className)} type={visible ? 'text' : 'password'} {...props} />
      <button
        aria-label={visible ? 'Скрыть пароль' : 'Показать пароль'}
        className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center justify-center size-8 rounded-[var(--radius-sm)] text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--surface-muted)] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
        onClick={() => setVisible((v) => !v)}
        tabIndex={-1}
        type="button"
      >
        {visible ? <EyeOff size={18} strokeWidth={1.8} /> : <Eye size={18} strokeWidth={1.8} />}
      </button>
    </div>
  );
});
