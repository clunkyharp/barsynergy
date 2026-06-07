import { ContentStatus } from '@prisma/client';
import { AdminFilterForm } from '@/components/admin/admin-filter-form';
import { Button } from '@/components/ui/button';
import {
  AdminActionRow
} from '@/components/ui/admin-table';
import { FormField } from '@/components/ui/form-field';
import { SearchInput } from '@/components/ui/search-input';
import { Select } from '@/components/ui/select';
import { contentStatusLabels, firstParam } from '@/lib/admin/content-ui';
import { cn } from '@/lib/utils';
import type { AdminFilterBarProps, AdminListFiltersProps, AdminStatusTabsProps } from './content-admin-controls-types';
import { adminQueryHref } from './content-admin-controls-utils';

export function AdminFilterBar({
  action,
  children,
  className,
  method = 'get',
  ...props
}: AdminFilterBarProps) {
  const classNames = cn(
    'admin-filter-panel admin-surface-shell rounded-[var(--radius-md)] border border-[var(--line)] bg-[var(--surface)] p-4 shadow-none',
    className
  );
  const content = <div className="admin-filter-toolbar">{children}</div>;

  if (method === 'get') {
    return (
      <AdminFilterForm action={action} className={classNames} {...props}>
        {content}
      </AdminFilterForm>
    );
  }

  return (
    <form
      action={action}
      className={classNames}
      method={method}
      {...props}
    >
      {content}
    </form>
  );
}

export function AdminStatusTabs({ items, label = 'Быстрые фильтры' }: AdminStatusTabsProps) {
  return (
    <nav aria-label={label} className="admin-status-tabs">
      {items.map((item) => (
        <Button
          aria-current={item.current ? 'page' : undefined}
          className={cn('admin-status-tab', item.current && 'admin-filter-active')}
          href={item.href}
          key={`${item.label}-${item.href}`}
          size="sm"
          variant={item.current ? 'secondary' : 'ghost'}
        >
          <span>{item.label}</span>
          {typeof item.count === 'number' ? <span className="admin-status-tab-count">{item.count}</span> : null}
        </Button>
      ))}
    </nav>
  );
}

export function AdminContentStatusTabs({ basePath, params }: Pick<AdminListFiltersProps, 'basePath' | 'params'>) {
  const selectedStatus = firstParam(params.status) ?? '';

  return (
    <AdminStatusTabs
      items={[
        { current: selectedStatus === '', href: adminQueryHref(basePath, params, { page: null, status: null }), label: 'Все' },
        ...Object.values(ContentStatus).map((status) => ({
          current: selectedStatus === status,
          href: adminQueryHref(basePath, params, { page: null, status }),
          label: contentStatusLabels[status]
        }))
      ]}
      label="Статусы публикации"
    />
  );
}

export function AdminListFilters({ basePath, includeStatus = true, params, filters = [], searchPlaceholder = 'Поиск по названию' }: AdminListFiltersProps) {
  const q = firstParam(params.q) ?? '';
  const status = firstParam(params.status) ?? '';

  return (
    <AdminFilterBar action={basePath}>
      <FormField htmlFor="admin-filter-q" label="Поиск">
        <SearchInput id="admin-filter-q" name="q" placeholder={searchPlaceholder} defaultValue={q} />
      </FormField>
      {includeStatus ? (
        <FormField htmlFor="admin-filter-status" label="Статус">
          <Select id="admin-filter-status" name="status" defaultValue={status}>
            <option value="">Все статусы</option>
            {Object.values(ContentStatus).map((item) => (
              <option key={item} value={item}>
                {contentStatusLabels[item]}
              </option>
            ))}
          </Select>
        </FormField>
      ) : null}
      {filters.map((filter) => (
        <FormField htmlFor={`admin-filter-${filter.name}`} label={filter.label} key={filter.name}>
          <Select id={`admin-filter-${filter.name}`} name={filter.name} defaultValue={firstParam(params[filter.name]) ?? ''}>
            <option value="">{filter.allLabel}</option>
            {filter.options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        </FormField>
      ))}
      <AdminActionRow className="justify-start">
        <Button type="submit" variant="secondary">
          Применить
        </Button>
        <Button href={basePath} variant="ghost">
          Сбросить
        </Button>
      </AdminActionRow>
    </AdminFilterBar>
  );
}
