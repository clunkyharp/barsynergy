import { cloneElement, isValidElement, type ReactElement, type ReactNode } from 'react';

type FormFieldProps = {
  label: string;
  htmlFor: string;
  error?: string;
  children: ReactNode;
};

export function FormField({ label, htmlFor, error, children }: FormFieldProps) {
  const errorId = `${htmlFor}-error`;
  let field = children;

  if (error && isValidElement(children)) {
    const child = children as ReactElement<{
      'aria-describedby'?: string;
      'aria-invalid'?: boolean;
    }>;

    field = cloneElement(child, {
      'aria-describedby': [child.props['aria-describedby'], errorId].filter(Boolean).join(' '),
      'aria-invalid': true
    });
  }

  return (
    <div className="space-y-2">
      <label className="text-sm font-semibold" htmlFor={htmlFor}>
        {label}
      </label>
      {field}
      {error ? (
        <p className="text-sm text-[var(--danger)]" id={errorId}>
          {error}
        </p>
      ) : null}
    </div>
  );
}
