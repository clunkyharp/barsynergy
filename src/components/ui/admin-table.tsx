import type { AnchorHTMLAttributes, ButtonHTMLAttributes, HTMLAttributes, TableHTMLAttributes, TdHTMLAttributes, ThHTMLAttributes } from 'react';
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

export function AdminTableActionsHeaderCell({ className, ...props }: ThHTMLAttributes<HTMLTableCellElement>) {
  return (
    <AdminTableHeaderCell
      className={cn(
        'sticky right-0 z-20 min-w-[168px] bg-[var(--surface-muted)] shadow-[-12px_0_18px_rgba(20,20,18,0.06)]',
        className
      )}
      {...props}
    />
  );
}

export function AdminTableActionsCell({ className, ...props }: TdHTMLAttributes<HTMLTableCellElement>) {
  return (
    <AdminTableCell
      className={cn(
        'sticky right-0 z-10 min-w-[168px] bg-[var(--surface)] shadow-[-12px_0_18px_rgba(20,20,18,0.06)]',
        className
      )}
      {...props}
    />
  );
}

export function AdminTableClamp({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('line-clamp-2 max-w-full break-words', className)} {...props} />;
}

export function AdminActionMenu({ className, children, ...props }: HTMLAttributes<HTMLDetailsElement>) {
  return (
    <details className={cn('group relative', className)} {...props}>
      {children}
    </details>
  );
}

export function AdminActionMenuTrigger({ className, children = '⋯', ...props }: HTMLAttributes<HTMLElement>) {
  return (
    <summary
      className={cn(
        'inline-flex min-h-9 cursor-pointer list-none items-center justify-center rounded-[var(--radius-md)] border border-[var(--line)] bg-[var(--surface-muted)] px-3 text-sm font-semibold text-[var(--text)] transition hover:border-[var(--accent)] hover:text-[var(--accent)] [&::-webkit-details-marker]:hidden',
        className
      )}
      {...props}
    >
      <span aria-hidden="true">{children}</span>
      <span className="sr-only">Открыть действия</span>
    </summary>
  );
}

export function AdminActionMenuContent({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'mt-2 grid min-w-48 gap-1 rounded-[var(--radius-md)] border border-[var(--line)] bg-[var(--surface)] p-2 shadow-[0_16px_40px_rgba(20,20,18,0.12)]',
        className
      )}
      {...props}
    />
  );
}

const actionMenuItemClassName =
  'flex min-h-9 w-full items-center rounded-[var(--radius-sm)] px-3 text-left text-sm font-semibold text-[var(--text)] transition hover:bg-[var(--surface-muted)] hover:text-[var(--accent)] disabled:pointer-events-none disabled:opacity-50';

export function AdminActionMenuLink({ className, ...props }: AnchorHTMLAttributes<HTMLAnchorElement>) {
  return <a className={cn(actionMenuItemClassName, className)} {...props} />;
}

export function AdminActionMenuButton({ className, tone = 'default', ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { tone?: 'default' | 'danger' }) {
  return (
    <button
      className={cn(actionMenuItemClassName, tone === 'danger' && 'text-[var(--danger)] hover:text-[var(--danger)]', className)}
      type="submit"
      {...props}
    />
  );
}
