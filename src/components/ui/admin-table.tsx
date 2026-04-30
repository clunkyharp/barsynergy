import type { HTMLAttributes, TableHTMLAttributes, TdHTMLAttributes, ThHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

type AdminTableProps = TableHTMLAttributes<HTMLTableElement> & {
  minWidth?: number | string;
};

export function AdminTableFrame({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('overflow-x-auto rounded-[var(--radius-lg)] border border-[var(--line)] bg-[var(--surface)]', className)} {...props} />;
}

export function AdminTable({ className, minWidth = '1040px', style, ...props }: AdminTableProps) {
  return <table className={cn('w-full border-collapse text-left text-sm', className)} style={{ minWidth, ...style }} {...props} />;
}

export function AdminTableHead({ className, ...props }: HTMLAttributes<HTMLTableSectionElement>) {
  return (
    <thead
      className={cn(
        'border-b border-[var(--line)] bg-[var(--surface-muted)] text-xs uppercase tracking-[0.08em] text-[var(--muted)]',
        className
      )}
      {...props}
    />
  );
}

export function AdminTableBody({ className, ...props }: HTMLAttributes<HTMLTableSectionElement>) {
  return <tbody className={className} {...props} />;
}

export function AdminTableRow({ className, ...props }: HTMLAttributes<HTMLTableRowElement>) {
  return <tr className={cn('border-b border-[var(--line)] last:border-0', className)} {...props} />;
}

export function AdminTableHeaderCell({ className, ...props }: ThHTMLAttributes<HTMLTableCellElement>) {
  return <th className={cn('px-4 py-3 font-semibold', className)} {...props} />;
}

export function AdminTableCell({ className, ...props }: TdHTMLAttributes<HTMLTableCellElement>) {
  return <td className={cn('px-4 py-4 align-top', className)} {...props} />;
}
