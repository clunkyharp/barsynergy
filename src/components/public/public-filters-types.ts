export type CategoryOption = {
  id: string;
  name: string;
  slug: string;
};

export type SelectOption = {
  value: string;
  label: string;
};

export type ExtraFilter = {
  name: string;
  label: string;
  allLabel?: string;
  options: SelectOption[];
};

export type FilterContextItem = {
  label: string;
  value: string;
};

export type PublicFiltersProps = {
  activeSummaryLabel?: string;
  categoryAllLabel?: string;
  categoryLabel?: string;
  categories?: CategoryOption[];
  cityAllLabel?: string;
  cityLabel?: string;
  cities?: CategoryOption[];
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
  tone?: 'default' | 'directory';
  variant?: 'stacked' | 'toolbar' | 'sidebar';
};

export type ActiveFilter = {
  name: string;
  label: string;
  value: string;
};
