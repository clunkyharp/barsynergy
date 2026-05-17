import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from 'react';
import { AppLink } from '@/components/ui/app-link';
import { cn } from '@/lib/utils';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'destructive' | 'inverse';
export type ButtonSize = 'sm' | 'md' | 'lg';

const variants: Record<ButtonVariant, string> = {
  primary:
    'border-[var(--accent)] bg-[var(--accent)] text-[var(--accent-contrast)] shadow-[var(--shadow-action)] hover:border-[var(--accent-strong)] hover:bg-[var(--accent-strong)]',
  secondary: 'border-[var(--accent)] bg-transparent text-[var(--accent)] hover:bg-[var(--accent)] hover:text-[var(--accent-contrast)]',
  ghost: 'border-transparent bg-transparent text-[var(--muted)] hover:text-[var(--accent)]',
  destructive: 'border-[var(--danger)] bg-[var(--danger)] text-white hover:bg-[#842726]',
  inverse: 'border-[var(--border-inverse)] bg-[var(--surface-inverse)] text-[var(--background)] hover:bg-[var(--accent)] hover:text-[var(--accent-contrast)]'
};

const sizes: Record<ButtonSize, string> = {
  sm: 'min-h-11 px-3 py-1.5 text-xs tracking-normal',
  md: 'min-h-11 px-5 py-2.5 text-sm tracking-normal',
  lg: 'min-h-12 px-6 py-3 text-sm tracking-normal'
};

type CommonProps = {
  children: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
  loading?: boolean;
  loadingText?: string;
};

export type ButtonProps = CommonProps & ButtonHTMLAttributes<HTMLButtonElement>;
type ButtonLinkProps = CommonProps &
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

export function Button(props: ButtonProps | ButtonLinkProps) {
  const { children, variant = 'primary', size = 'md', className, loading = false, loadingText, ...rest } = props;
  const classes = cn(
    'inline-flex items-center justify-center gap-2.5 whitespace-nowrap rounded-[var(--radius-md)] border text-center font-semibold transition focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-1 focus-visible:ring-offset-[var(--background)] active:translate-y-px disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-55 aria-disabled:pointer-events-none aria-disabled:cursor-not-allowed aria-disabled:opacity-55 aria-busy:cursor-wait',
    variants[variant],
    sizes[size],
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
      <AppLink
        {...linkRest}
        aria-busy={loading || undefined}
        aria-disabled={isDisabled || undefined}
        className={classes}
        data-button-size={size}
        data-button-variant={variant}
        tabIndex={isDisabled ? -1 : linkRest.tabIndex}
      >
        {content}
      </AppLink>
    );
  }

  const { disabled, ...buttonRest } = rest;

  return (
    <button
      aria-busy={loading || undefined}
      className={classes}
      data-button-size={size}
      data-button-variant={variant}
      disabled={disabled || loading}
      {...buttonRest}
    >
      {content}
    </button>
  );
}
