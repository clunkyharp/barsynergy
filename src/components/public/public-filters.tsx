'use client';

import { Suspense } from 'react';
import type { PublicFiltersProps } from './public-filters-types';
import { PublicFiltersFallback } from './public-filters-fallback';
import { PublicFiltersContent } from './public-filters-content';

export { type CategoryOption, type SelectOption, type ExtraFilter, type FilterContextItem, type PublicFiltersProps, type ActiveFilter } from './public-filters-types';
export { PublicFiltersFallback, resolveFilterVariant } from './public-filters-fallback';
export { PublicFiltersContent } from './public-filters-content';
export { PublicFiltersToolbarVariant, PublicFiltersSidebarVariant, PublicFiltersStackedVariant } from './public-filters-variants';

export function PublicFilters(props: PublicFiltersProps) {
  return (
    <Suspense fallback={<PublicFiltersFallback {...props} />}>
      <PublicFiltersContent {...props} />
    </Suspense>
  );
}
