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
};

type ButtonProps = CommonProps & ButtonHTMLAttributes<HTMLButtonElement>;
type LinkProps = CommonProps & AnchorHTMLAttributes<HTMLAnchorElement> & { href: string };

export function Button(props: ButtonProps | LinkProps) {
  const { children, variant = 'primary', className, ...rest } = props;
  const classes = cn(
    'inline-flex min-h-11 items-center justify-center gap-2 rounded-md border px-5 py-2.5 text-sm font-semibold transition',
    variants[variant],
    className
  );

  if ('href' in rest) {
    return (
      <a className={classes} {...rest}>
        {children}
      </a>
    );
  }

  return (
    <button className={classes} {...rest}>
      {children}
    </button>
  );
}
