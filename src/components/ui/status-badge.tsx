import type { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export type StatusBadgeVariant = 'success' | 'warning' | 'danger' | 'neutral' | 'pending';

const variants: Record<StatusBadgeVariant, { chip: string; dot: string }> = {
  success: {
    chip: 'border-[var(--success-border)] bg-[var(--success-bg)] text-[var(--success-text)]',
    dot: 'bg-[var(--success-text)]'
  },
  warning: {
    chip: 'border-[var(--warning-border)] bg-[var(--warning-bg)] text-[var(--warning-text)]',
    dot: 'bg-[var(--warning-text)]'
  },
  danger: {
    chip: 'border-[var(--danger-border)] bg-[var(--danger-bg)] text-[var(--danger-text)]',
    dot: 'bg-[var(--danger-text)]'
  },
  neutral: {
    chip: 'border-[var(--border-default)] bg-[var(--surface-wash)] text-[var(--text)]',
    dot: 'bg-[var(--muted)]'
  },
  pending: {
    chip: 'border-[var(--border-default)] bg-[var(--pending-bg)] text-[var(--muted)]',
    dot: 'bg-[var(--muted)]'
  }
};

type StatusBadgeProps = HTMLAttributes<HTMLSpanElement> & {
  variant?: StatusBadgeVariant;
  showDot?: boolean;
};

export function AdminStatusChip({ children, className, variant = 'neutral', showDot = true, ...props }: StatusBadgeProps) {
  const styles = variants[variant];
  const isSolidVariant = variant === 'success' || variant === 'danger';

  return (
    <span
      className={cn(
        'inline-flex min-h-8 items-center gap-1.5 whitespace-nowrap rounded-[var(--radius-pill)] border px-2.5 py-1.5 text-[11px] font-semibold leading-[14px] tracking-[0]',
        isSolidVariant && 'shadow-none',
        styles.chip,
        className
      )}
      data-component="admin-status-badge"
      {...props}
    >
      {showDot ? <span aria-hidden="true" className={cn('h-1.5 w-1.5 rounded-full', styles.dot)} /> : null}
      <span>{children}</span>
    </span>
  );
}

export function StatusBadge(props: StatusBadgeProps) {
  return <AdminStatusChip {...props} />;
}
