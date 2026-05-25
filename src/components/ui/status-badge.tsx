import type { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export type StatusBadgeVariant = 'success' | 'warning' | 'danger' | 'neutral' | 'pending';

const variants: Record<StatusBadgeVariant, { chip: string; dot: string }> = {
  success: {
    chip: 'border-[#b6dcc8] bg-[#e5f4ea] text-[#1e7a4d]',
    dot: 'bg-[#1e7a4d]'
  },
  warning: {
    chip: 'border-[#e2c780] bg-[#fff1d6] text-[#a15c07]',
    dot: 'bg-[#a15c07]'
  },
  danger: {
    chip: 'border-[var(--danger-border)] bg-[var(--danger-bg)] text-[var(--danger-text)]',
    dot: 'bg-[var(--danger-text)]'
  },
  neutral: {
    chip: 'border-[#ded2c2] bg-[#fbf8f1] text-[#171513]',
    dot: 'bg-[#8a8178]'
  },
  pending: {
    chip: 'border-[#bfd4ea] bg-[#e5f0fa] text-[#1d5d8c]',
    dot: 'bg-[#1d5d8c]'
  }
};

type StatusBadgeProps = HTMLAttributes<HTMLSpanElement> & {
  variant?: StatusBadgeVariant;
  showDot?: boolean;
};

export function AdminStatusChip({ children, className, variant = 'neutral', showDot = true, ...props }: StatusBadgeProps) {
  const styles = variants[variant];

  return (
    <span
      className={cn(
        'inline-flex min-h-8 items-center gap-1.5 rounded-[var(--radius-pill)] border px-2.5 py-1.5 text-[11px] font-semibold leading-[14px] tracking-[0]',
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
