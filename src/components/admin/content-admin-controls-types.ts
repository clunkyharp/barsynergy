import type { FormHTMLAttributes, ReactNode } from 'react';
import type { ContentStatusValue } from '@/lib/admin/content-status';
import type { AdminContentSearchParams } from '@/lib/admin/content-utils';

export type AdminActionAlertProps = {
  params: AdminContentSearchParams;
};

export type AdminPaginationProps = {
  basePath: string;
  params: AdminContentSearchParams;
  page: number;
  totalPages: number;
  total: number;
  pageSize: number;
};

export type HiddenRedirectProps = {
  value: string;
};

export type CoverImageFieldProps = {
  id: string;
  currentName?: string | null;
  currentAlt?: string | null;
  inputName?: string;
  label?: string;
  altLabel?: string;
  altName?: string;
  removeName?: string;
};

export type AdminListFiltersProps = {
  basePath: string;
  includeStatus?: boolean;
  params: AdminContentSearchParams;
  filters?: {
    name: string;
    label: string;
    allLabel: string;
    options: { value: string; label: string }[];
  }[];
  searchPlaceholder?: string;
};

export type AdminFilterBarProps = Omit<FormHTMLAttributes<HTMLFormElement>, 'action' | 'method'> & {
  action: string;
  children: ReactNode;
  method?: 'get' | 'post';
};

export type AdminStatusTabItem = {
  count?: number;
  current?: boolean;
  href: string;
  label: string;
};

export type AdminStatusTabsProps = {
  items: AdminStatusTabItem[];
  label?: string;
};

export type AdminContentRowActionsProps = {
  currentPath: string;
  deleteAction: (formData: FormData) => Promise<void>;
  editHref: string;
  idName: string;
  idValue: string;
  publicHref?: string;
  status: ContentStatusValue;
  updateStatusAction: (formData: FormData) => Promise<void>;
};

export type AdminContentVisibilityPanelProps = {
  currentPath: string;
  idName: string;
  idValue: string;
  publicHref?: string;
  status: ContentStatusValue;
  updateStatusAction: (formData: FormData) => Promise<void>;
};
