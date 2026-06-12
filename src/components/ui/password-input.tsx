'use client';

import { forwardRef, useState, useEffect, useRef, useCallback, type InputHTMLAttributes } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

export const PasswordInput = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(function PasswordInput(
  { className, ...props },
  ref
) {
  const [visible, setVisible] = useState(false);
  const [hasValue, setHasValue] = useState(false);
  const innerRef = useRef<HTMLInputElement>(null);

  const mergedRef = useCallback(
    (node: HTMLInputElement | null) => {
      innerRef.current = node;
      if (typeof ref === 'function') ref(node);
      else if (ref) ref.current = node;
    },
    [ref],
  );

  useEffect(() => {
    const el = innerRef.current;
    if (!el) return;

    function sync() {
      const filled = (el?.value.length ?? 0) > 0;
      setHasValue(filled);
      // revert visibility when field is cleared so type stays "password"
      if (!filled) setVisible(false);
    }

    sync();
    el.addEventListener('input', sync);
    el.addEventListener('change', sync);
    // Chrome autofill fires animationstart; mirror what Input already does
    el.addEventListener('animationstart', sync);
    return () => {
      el.removeEventListener('input', sync);
      el.removeEventListener('change', sync);
      el.removeEventListener('animationstart', sync);
    };
  }, []);

  return (
    <div className="relative">
      <Input ref={mergedRef} className={cn('pr-10', className)} type={visible ? 'text' : 'password'} {...props} />
      {hasValue ? (
        <button
          aria-label={visible ? 'Скрыть пароль' : 'Показать пароль'}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center justify-center size-8 rounded-[var(--radius-sm)] text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--surface-muted)] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
          onClick={() => setVisible((v) => !v)}
          tabIndex={-1}
          type="button"
        >
          {visible ? <EyeOff size={18} strokeWidth={1.8} /> : <Eye size={18} strokeWidth={1.8} />}
        </button>
      ) : null}
    </div>
  );
});
