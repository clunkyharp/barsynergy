import { cloneElement, isValidElement, type ReactElement, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

type FormFieldProps = {
  label: string;
  htmlFor: string;
  error?: string;
  hint?: string;
  className?: string;
  children: ReactNode;
};

export function FormField({ label, htmlFor, error, hint, className, children }: FormFieldProps) {
  const errorId = `${htmlFor}-error`;
  const hintId = `${htmlFor}-hint`;
  let field = children;

  if ((error || hint) && isValidElement(children)) {
    const child = children as ReactElement<{
      'aria-describedby'?: string;
      'aria-invalid'?: boolean;
    }>;

    field = cloneElement(child, {
      'aria-describedby': [child.props['aria-describedby'], hint ? hintId : null, error ? errorId : null]
        .filter(Boolean)
        .join(' '),
      'aria-invalid': error ? true : child.props['aria-invalid']
    });
  }

  return (
    <div className={cn('space-y-2.5', className)}>
      <label className="block text-[12px] font-semibold uppercase tracking-[0.12em] text-[var(--muted)]" htmlFor={htmlFor}>
        {label}
      </label>
      {field}
      {hint ? (
        <p className="text-sm leading-6 text-[var(--muted)]" id={hintId}>
          {hint}
        </p>
      ) : null}
      {error ? (
        <p className="text-sm leading-6 text-[var(--danger)]" id={errorId}>
          {error}
        </p>
      ) : null}
    </div>
  );
}
