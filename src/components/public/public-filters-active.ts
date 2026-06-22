import type {
  ActiveFilter,
  CategoryOption,
  ExtraFilter,
  FilterMode
} from './public-filters-types';

export function getParamValues(searchParams: URLSearchParams, name: string): string[] {
  const raw = searchParams?.get(name) ?? '';
  return raw
    .split(',')
    .map((v) => v.trim())
    .filter(Boolean);
}

export function parseSingleParam(searchParams: URLSearchParams, name: string): string {
  return searchParams?.get(name) ?? '';
}

type BuildActiveFiltersArgs = {
  params: URLSearchParams;
  currentQ: string;
  categoryLabel: string;
  categoryMode: FilterMode;
  categories: CategoryOption[];
  currentCategory: string;
  currentCategories: string[];
  cityLabel: string;
  cityMode: FilterMode;
  cities: CategoryOption[];
  currentCity: string;
  currentCities: string[];
  extraFilters: ExtraFilter[];
};

export function buildActiveFilters({
  params,
  currentQ,
  categoryLabel,
  categoryMode,
  categories,
  currentCategory,
  currentCategories,
  cityLabel,
  cityMode,
  cities,
  currentCity,
  currentCities,
  extraFilters
}: BuildActiveFiltersArgs): ActiveFilter[] {
  const items: ActiveFilter[] = [];

  if (currentQ.trim()) {
    items.push({
      name: 'q',
      label: 'Поиск',
      mode: 'single',
      values: [{ label: currentQ.trim(), value: currentQ.trim() }]
    });
  }

  if (categoryMode === 'multiple') {
    const selectedCategories = currentCategories
      .map((slug) => {
        const cat = categories.find((item) => item.slug === slug);
        return cat ? { label: cat.name, value: cat.slug } : null;
      })
      .filter(Boolean) as { label: string; value: string }[];
    if (selectedCategories.length > 0) {
      items.push({ name: 'category', label: categoryLabel, mode: 'multiple', values: selectedCategories });
    }
  } else if (currentCategory) {
    const category = categories.find((item) => item.slug === currentCategory);
    items.push({
      name: 'category',
      label: categoryLabel,
      mode: 'single',
      values: [{ label: category?.name ?? currentCategory, value: currentCategory }]
    });
  }

  if (cityMode === 'multiple') {
    const selectedCities = currentCities
      .map((slug) => {
        const city = cities.find((item) => item.slug === slug);
        return city ? { label: city.name, value: city.slug } : null;
      })
      .filter(Boolean) as { label: string; value: string }[];
    if (selectedCities.length > 0) {
      items.push({ name: 'city', label: cityLabel, mode: 'multiple', values: selectedCities });
    }
  } else if (currentCity) {
    const city = cities.find((item) => item.slug === currentCity);
    items.push({
      name: 'city',
      label: cityLabel,
      mode: 'single',
      values: [{ label: city?.name ?? currentCity, value: currentCity }]
    });
  }

  extraFilters.forEach((filter) => {
    const mode = filter.mode ?? 'single';
    if (mode === 'multiple') {
      const values = getParamValues(params, filter.name);
      if (values.length === 0) return;
      const matched = values
        .map((v) => {
          const option = filter.options.find((item) => item.value === v);
          return option ? { label: option.label, value: option.value } : null;
        })
        .filter(Boolean) as { label: string; value: string }[];
      if (matched.length > 0) {
        items.push({ name: filter.name, label: filter.label, mode: 'multiple', values: matched });
      }
    } else {
      const value = parseSingleParam(params, filter.name);
      if (!value) return;
      const option = filter.options.find((item) => item.value === value);
      items.push({
        name: filter.name,
        label: filter.label,
        mode: 'single',
        values: [{ label: option?.label ?? value, value }]
      });
    }
  });

  return items;
}
