import type { CSSProperties, HTMLAttributes, ReactNode, TableHTMLAttributes, TdHTMLAttributes, ThHTMLAttributes } from 'react';
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
  mobileLayout?: 'cards' | 'scroll';
};

type AdminTableCellProps = TdHTMLAttributes<HTMLTableCellElement> & {
  label?: string;
};

type AdminTableState = 'loading' | 'empty' | 'no-results' | 'error';

type AdminTableStateRowProps = HTMLAttributes<HTMLTableRowElement> & {
  colSpan: number;
  description?: ReactNode;
  state: AdminTableState;
  title: ReactNode;
};

export function AdminTableFrame({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'admin-surface-shell admin-data-table-frame overflow-x-auto',
        className
      )}
      {...props}
    />
  );
}

export function AdminDataTable({ className, minWidth = '1040px', mobileLayout = 'cards', style, ...props }: AdminTableProps) {
  return (
    <table
      aria-label="Таблица данных"
      className={cn('admin-data-table w-full border-collapse text-left text-[13px] leading-[18px]', className)}
      data-mobile-layout={mobileLayout}
      role="grid"
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
        'admin-data-table-head border-b border-[var(--line)] bg-[var(--admin-table-header)] text-[11px] text-[var(--muted)]',
        className
      )}
      {...props}
    />
  );
}

export function AdminTableBody({ className, ...props }: HTMLAttributes<HTMLTableSectionElement>) {
  return <tbody className={className} {...props} />;
}

export function AdminTableStateRow({ className, colSpan, description, state, title, ...props }: AdminTableStateRowProps) {
  return (
    <tr
      aria-busy={state === 'loading' || undefined}
      className={cn('admin-data-table-state-row', className)}
      data-state={state}
      {...props}
    >
      <td className="admin-data-table-state-cell" colSpan={colSpan}>
        <div className="admin-data-table-state-content">
          <p className="admin-data-table-state-title">{title}</p>
          {description ? <p className="admin-data-table-state-description">{description}</p> : null}
        </div>
      </td>
    </tr>
  );
}

export function AdminTableRow({ className, ...props }: HTMLAttributes<HTMLTableRowElement>) {
  return (
    <tr
      className={cn(
        'admin-data-table-row border-b border-[var(--line)] transition-colors last:border-0 hover:bg-[var(--admin-table-row-hover)]',
        className
      )}
      {...props}
    />
  );
}

export function AdminTableHeaderCell({ className, ...props }: ThHTMLAttributes<HTMLTableCellElement>) {
  return <th className={cn('admin-data-table-header-cell min-w-[7rem] whitespace-nowrap px-4 py-3 font-semibold', className)} {...props} />;
}

export function AdminTableCell({ className, label, ...props }: AdminTableCellProps) {
  return <td className={cn('admin-data-table-cell px-4 py-3.5 align-top', className)} data-label={label} {...props} />;
}

export function AdminTableActionsHeaderCell({ className, ...props }: ThHTMLAttributes<HTMLTableCellElement>) {
  return (
    <AdminTableHeaderCell
      className={cn(
        'sticky right-0 z-20 min-w-[112px] border-l border-[var(--line)] bg-[var(--admin-table-header)] text-right sm:min-w-[148px] lg:min-w-[168px]',
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
        'sticky right-0 z-10 min-w-[112px] border-l border-[var(--line)] bg-[var(--admin-surface)] text-right sm:min-w-[148px] lg:min-w-[168px]',
        'admin-table-actions-cell',
        className
      )}
      label="Действия"
      {...props}
    />
  );
}

export function AdminTableClamp({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('line-clamp-2 max-w-full break-words', className)} {...props} />;
}

export function AdminActionRow({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('admin-action-row flex flex-wrap items-center justify-end gap-2', className)} {...props} />;
}

export function AdminRowActions({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('flex items-center justify-end gap-2 whitespace-nowrap', className)} {...props} />;
}
