import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from 'react';
import { AppLink } from '@/components/ui/app-link';
import { cn } from '@/lib/utils';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'link' | 'destructive' | 'inverse';
export type ButtonSize = 'sm' | 'md' | 'lg';

const variants: Record<ButtonVariant, string> = {
  primary:
    'border-[var(--accent)] bg-[var(--accent)] text-[var(--accent-contrast)] shadow-none hover:border-[var(--accent-strong)] hover:bg-[var(--accent-strong)]',
  secondary:
    'border-[var(--border-strong)] bg-[var(--surface)] text-[var(--text)] shadow-none hover:border-[var(--accent)] hover:bg-[var(--surface-wash-strong)] hover:text-[var(--text)]',
  ghost:
    'border-[var(--border-default)] bg-transparent text-[var(--text)] shadow-none hover:border-[var(--border-strong)] hover:bg-[var(--surface-wash)] hover:text-[var(--text)]',
  link: 'border-transparent bg-transparent px-0 text-[var(--accent)] shadow-none hover:text-[var(--accent-strong)]',
  destructive: 'border-[var(--danger-action-bg)] bg-[var(--danger-action-bg)] text-[var(--danger-action-text)] hover:bg-[var(--danger-action-bg-hover)]',
  inverse: 'border-[var(--border-inverse)] bg-[var(--surface-inverse)] text-[var(--background)] hover:bg-[var(--accent)] hover:text-[var(--accent-contrast)]'
};

const sizes: Record<ButtonSize, string> = {
  sm: 'h-11 px-[18px] py-[11px] text-[15px] leading-5 tracking-normal',
  md: 'h-11 px-[18px] py-[11px] text-[15px] leading-5 tracking-normal',
  lg: 'h-12 px-6 py-3 text-[15px] leading-5 tracking-normal'
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
    'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[10px] border text-center font-semibold transition-[background-color,border-color,color,box-shadow] duration-[var(--motion-duration-fast)] ease-[var(--motion-ease-standard)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)] motion-reduce:transition-none disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-[var(--surface-muted)] disabled:text-[var(--muted)] disabled:opacity-60 aria-disabled:pointer-events-none aria-disabled:cursor-not-allowed aria-disabled:bg-[var(--surface-muted)] aria-disabled:text-[var(--muted)] aria-disabled:opacity-60 aria-busy:cursor-wait',
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
