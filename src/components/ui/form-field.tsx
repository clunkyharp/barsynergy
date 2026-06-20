import { cloneElement, isValidElement, type ComponentPropsWithoutRef, type ReactElement, type ReactNode } from 'react';
import { formActionsClassName, formSectionClassName } from '@/components/ui/field-styles';
import { cn } from '@/lib/utils';

type FormFieldProps = {
  label: string;
  labelSuffix?: ReactNode;
  htmlFor: string;
  error?: string;
  hint?: string;
  className?: string;
  labelClassName?: string;
  labelSize?: 'default' | 'sm';
  children: ReactNode;
  required?: boolean;
  success?: string;
};

export function FieldLabel({
  children,
  className,
  htmlFor,
  required,
  size
}: {
  children: ReactNode;
  className?: string;
  htmlFor: string;
  required?: boolean;
  size?: 'default' | 'sm';
}) {
  return (
    <label className={cn('field-label', size === 'sm' && 'field-label-compact', className)} htmlFor={htmlFor}>
      {children}
      {required ? <span aria-hidden="true" className="text-[var(--accent)]"> *</span> : null}
    </label>
  );
}

export function FieldHint({ children, className, id }: { children: ReactNode; className?: string; id?: string }) {
  return (
    <p className={cn('field-hint', className)} id={id}>
      {children}
    </p>
  );
}

export function FieldError({ children, className, id }: { children: ReactNode; className?: string; id?: string }) {
  return (
    <p aria-live="polite" className={cn('field-error', className)} id={id} role="alert">
      {children}
    </p>
  );
}

export function FieldSuccess({ children, className, id }: { children: ReactNode; className?: string; id?: string }) {
  return (
    <p aria-live="polite" className={cn('field-success', className)} id={id} role="status">
      {children}
    </p>
  );
}

export function FormField({ label, labelSuffix, htmlFor, error, hint, className, labelClassName, labelSize, children, required, success }: FormFieldProps) {
  const errorId = `${htmlFor}-error`;
  const hintId = `${htmlFor}-hint`;
  const successId = `${htmlFor}-success`;
  const isRequired = required ?? (isValidElement(children) ? Boolean((children as ReactElement<{ required?: boolean }>).props.required) : false);
  let field = children;

  if ((error || hint || success) && isValidElement(children)) {
    const child = children as ReactElement<{
      'aria-describedby'?: string;
      'aria-invalid'?: boolean;
      'data-state'?: string;
    }>;

    field = cloneElement(child, {
      'aria-describedby': [child.props['aria-describedby'], hint ? hintId : null, error ? errorId : null, success ? successId : null]
        .filter(Boolean)
        .join(' '),
      'aria-invalid': error ? true : child.props['aria-invalid'],
      'data-state': error ? 'error' : success ? 'success' : child.props['data-state']
    });
  }

  return (
    <div className={cn('form-field', className)} data-state={error ? 'error' : success ? 'success' : undefined}>
      <FieldLabel className={cn('inline-flex items-center gap-1.5', labelClassName)} htmlFor={htmlFor} required={isRequired} size={labelSize}>{label}{labelSuffix ?? null}</FieldLabel>
      {field}
      <div className="field-message-slot">
        {error
          ? <FieldError id={errorId}>{error}</FieldError>
          : success
          ? <FieldSuccess id={successId}>{success}</FieldSuccess>
          : hint
          ? <FieldHint id={hintId}>{hint}</FieldHint>
          : null}
      </div>
    </div>
  );
}

export function FormSection({
  children,
  className,
  description,
  title
}: {
  children: ReactNode;
  className?: string;
  description?: string;
  title: string;
}) {
  return (
    <section className={cn(formSectionClassName, className)}>
      <div className="form-section-header">
        <h3 className="form-section-title">{title}</h3>
        {description ? <p className="form-section-description">{description}</p> : null}
      </div>
      <div className="form-section-body">{children}</div>
    </section>
  );
}

type FormActionsProps = ComponentPropsWithoutRef<'div'> & {
  children: ReactNode;
};

export function FormActions({ children, className, ...props }: FormActionsProps) {
  return <div className={cn(formActionsClassName, className)} {...props}>{children}</div>;
}
