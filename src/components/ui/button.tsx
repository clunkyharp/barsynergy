import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/utils';

type Variant = 'primary' | 'secondary' | 'ghost';

const variants: Record<Variant, string> = {
  primary: 'border-[var(--accent)] bg-[var(--accent)] text-white hover:bg-[var(--accent-strong)]',
  secondary: 'border-[var(--line)] bg-transparent text-[var(--text)] hover:border-[var(--accent)] hover:text-[var(--accent)]',
  ghost: 'border-transparent bg-transparent text-[var(--muted)] hover:text-[var(--accent)]'
};

type CommonProps = {
  children: ReactNode;
  variant?: Variant;
  className?: string;
  loading?: boolean;
  loadingText?: string;
};

type ButtonProps = CommonProps & ButtonHTMLAttributes<HTMLButtonElement>;
type LinkProps = CommonProps &
  AnchorHTMLAttributes<HTMLAnchorElement> & {
    href: string;
    disabled?: boolean;
  };

function LoadingMark() {
  return (
    <span
      aria-hidden="true"
      className="h-4 w-4 shrink-0 animate-spin rounded-full border-2 border-current border-r-transparent"
    />
  );
}

export function Button(props: ButtonProps | LinkProps) {
  const { children, variant = 'primary', className, loading = false, loadingText, ...rest } = props;
  const classes = cn(
    'inline-flex min-h-11 items-center justify-center gap-2 rounded-md border px-5 py-2.5 text-sm font-semibold transition active:translate-y-px disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-55 aria-disabled:pointer-events-none aria-disabled:cursor-not-allowed aria-disabled:opacity-55 aria-busy:cursor-wait',
    variants[variant],
    className
  );
  const content = loading ? (
    <>
      <LoadingMark />
      <span>{loadingText ?? children}</span>
    </>
  ) : (
    children
  );

  if ('href' in rest) {
    const { disabled, ...linkRest } = rest;
    const isDisabled = disabled || loading;

    return (
      <a
        {...linkRest}
        aria-busy={loading || undefined}
        aria-disabled={isDisabled || undefined}
        className={classes}
        tabIndex={isDisabled ? -1 : linkRest.tabIndex}
      >
        {content}
      </a>
    );
  }

  const { disabled, ...buttonRest } = rest;

  return (
    <button aria-busy={loading || undefined} className={classes} disabled={disabled || loading} {...buttonRest}>
      {content}
    </button>
  );
}
