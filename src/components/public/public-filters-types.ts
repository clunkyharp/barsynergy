import type { ReactNode } from 'react';

export type CategoryOption = {
  id: string;
  name: string;
  slug: string;
};

export type SelectOption = {
  value: string;
  label: string;
};

export type FilterMode = 'single' | 'multiple';

export type ExtraFilter = {
  name: string;
  label: string;
  allLabel?: string;
  options: SelectOption[];
  mode?: FilterMode;
};

export type FilterContextItem = {
  label: string;
  value: string;
};

export type PublicFiltersProps = {
  activeSummaryLabel?: string;
  activeSummaryCountLabel?: string;
  categoryAllLabel?: string;
  categoryLabel?: string;
  categories?: CategoryOption[];
  categoryMode?: FilterMode;
  cityAllLabel?: string;
  cityLabel?: string;
  cities?: CategoryOption[];
  cityMode?: FilterMode;
  compact?: boolean;
  contextItems?: FilterContextItem[];
  collapseLabel?: string;
  defaultCollapsed?: boolean;
  embedded?: boolean;
  expandLabel?: string;
  extraFilters?: ExtraFilter[];
  placeholder?: string;
  description?: string;
  title?: string;
  titleMeta?: ReactNode;
  tone?: 'default' | 'directory';
  variant?: 'stacked' | 'toolbar' | 'sidebar';
};

export type ActiveFilterValue = {
  label: string;
  value: string;
};

export type ActiveFilter = {
  name: string;
  label: string;
  mode?: FilterMode;
  values: ActiveFilterValue[];
};
