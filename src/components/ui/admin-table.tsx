import type { CSSProperties, HTMLAttributes, TableHTMLAttributes, TdHTMLAttributes, ThHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';
export {
  AdminActionMenu,
  AdminActionMenuButton,
  AdminActionMenuContent,
  AdminActionMenuLink,
  AdminActionMenuTrigger
} from '@/components/ui/admin-action-menu';

type AdminTableProps = TableHTMLAttributes<HTMLTableElement> & {
  minWidth?: number | string;
};

export function AdminTableFrame({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'overflow-x-auto rounded-[var(--radius-md)] border border-[var(--line)] border-l-2 border-l-[var(--admin-structure-accent)] bg-[var(--surface)] shadow-none',
        className
      )}
      {...props}
    />
  );
}

export function AdminDataTable({ className, minWidth = '1040px', style, ...props }: AdminTableProps) {
  return (
    <table
      className={cn('admin-data-table w-full border-collapse text-left text-[13px]', className)}
      style={
        {
          '--admin-table-min-width': typeof minWidth === 'number' ? `${minWidth}px` : minWidth,
          ...style
        } as CSSProperties
      }
      {...props}
    />
  );
}

export function AdminTable(props: AdminTableProps) {
  return <AdminDataTable {...props} />;
}

export function AdminTableHead({ className, ...props }: HTMLAttributes<HTMLTableSectionElement>) {
  return (
    <thead
      className={cn(
        'border-b border-[var(--line)] bg-[color-mix(in_oklab,var(--surface-muted),var(--surface)_34%)] text-[11px] uppercase tracking-[0.1em] text-[var(--muted)]',
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
  return (
    <tr
      className={cn(
        'border-b border-[var(--line)] transition-colors last:border-0 hover:bg-[color-mix(in_oklab,var(--surface-muted),var(--surface)_62%)]',
        className
      )}
      {...props}
    />
  );
}

export function AdminTableHeaderCell({ className, ...props }: ThHTMLAttributes<HTMLTableCellElement>) {
  return <th className={cn('min-w-[7rem] whitespace-nowrap px-4 py-3 font-semibold', className)} {...props} />;
}

export function AdminTableCell({ className, ...props }: TdHTMLAttributes<HTMLTableCellElement>) {
  return <td className={cn('px-4 py-3.5 align-top', className)} {...props} />;
}

export function AdminTableActionsHeaderCell({ className, ...props }: ThHTMLAttributes<HTMLTableCellElement>) {
  return (
    <AdminTableHeaderCell
      className={cn(
        'sticky right-0 z-20 min-w-[112px] border-l border-[var(--line)] bg-[color-mix(in_oklab,var(--surface-muted),var(--surface)_34%)] text-right sm:min-w-[148px] lg:min-w-[168px]',
        'admin-table-actions-header',
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
        'sticky right-0 z-10 min-w-[112px] border-l border-[var(--line)] bg-[var(--surface)] text-right sm:min-w-[148px] lg:min-w-[168px]',
        'admin-table-actions-cell',
        className
      )}
      {...props}
    />
  );
}

export function AdminTableClamp({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('line-clamp-2 max-w-full break-words', className)} {...props} />;
}

export function AdminActionRow({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('flex flex-wrap items-center justify-end gap-2', className)} {...props} />;
}

export function AdminRowActions({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('flex items-center justify-end gap-2 whitespace-nowrap', className)} {...props} />;
}
