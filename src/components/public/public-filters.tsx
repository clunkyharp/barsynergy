'use client';

import { useEffect, useMemo, useState, useTransition } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { ChevronDown, RotateCcw, Search, SlidersHorizontal, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Panel } from '@/components/ui/panel';
import { Select } from '@/components/ui/select';
import { cn } from '@/lib/utils';

type CategoryOption = {
  id: string;
  name: string;
  slug: string;
};

type SelectOption = {
  value: string;
  label: string;
};

type ExtraFilter = {
  name: string;
  label: string;
  allLabel?: string;
  options: SelectOption[];
};

type PublicFiltersProps = {
  categories?: CategoryOption[];
  cities?: CategoryOption[];
  embedded?: boolean;
  extraFilters?: ExtraFilter[];
  placeholder?: string;
};

type ActiveFilter = {
  name: string;
  label: string;
  value: string;
};

function fieldClassName() {
  return 'min-h-11 rounded-[var(--radius-lg)] border-black/10 bg-[rgba(255,252,248,0.94)] px-4 py-2.5 text-sm leading-6 placeholder:text-[var(--muted)] hover:border-black/20 focus:border-[var(--accent)] focus:bg-white';
}

export function PublicFilters({
  categories = [],
  cities = [],
  embedded = false,
  extraFilters = [],
  placeholder = 'Поиск по названию или теме...'
}: PublicFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [draftQuery, setDraftQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const currentQ = searchParams?.get('q') ?? '';
  const currentCategory = searchParams?.get('category') ?? '';
  const currentCity = searchParams?.get('city') ?? '';
  const hasFilters = categories.length > 0 || cities.length > 0 || extraFilters.length > 0;

  useEffect(() => {
    setDraftQuery(currentQ);
  }, [currentQ]);

  function pushParams(params: URLSearchParams, options?: { replace?: boolean }) {
    const query = params.toString();
    const nextPath = pathname ?? '/';

    startTransition(() => {
      const nextUrl = query ? `${nextPath}?${query}` : nextPath;

      if (options?.replace) {
        router.replace(nextUrl, { scroll: false });
        return;
      }

      router.push(nextUrl, { scroll: false });
    });
  }

  function handleFilter(name: string, value: string, options?: { replace?: boolean }) {
    const params = new URLSearchParams(searchParams?.toString() ?? '');

    if (value) {
      params.set(name, value);
    } else {
      params.delete(name);
    }

    params.delete('page');
    pushParams(params, options);
  }

  function clearAllFilters() {
    setDraftQuery('');
    pushParams(new URLSearchParams());
  }

  function clearSingleFilter(name: string) {
    if (name === 'q') {
      setDraftQuery('');
    }

    handleFilter(name, '', { replace: name === 'q' });
  }

  useEffect(() => {
    const normalizedDraft = draftQuery.trim();
    const normalizedCurrent = currentQ.trim();

    if (normalizedDraft === normalizedCurrent) {
      return;
    }

    const timerId = window.setTimeout(() => {
      handleFilter('q', normalizedDraft, { replace: true });
    }, 300);

    return () => {
      window.clearTimeout(timerId);
    };
  }, [draftQuery, currentQ, pathname, router, searchParams]);

  const activeFilters = useMemo(() => {
    const items: ActiveFilter[] = [];

    if (currentQ.trim()) {
      items.push({ name: 'q', label: 'Поиск', value: currentQ.trim() });
    }

    if (currentCategory) {
      const category = categories.find((item) => item.slug === currentCategory);

      if (category) {
        items.push({ name: 'category', label: 'Категория', value: category.name });
      }
    }

    if (currentCity) {
      const city = cities.find((item) => item.slug === currentCity);

      if (city) {
        items.push({ name: 'city', label: 'Город', value: city.name });
      }
    }

    extraFilters.forEach((filter) => {
      const value = searchParams?.get(filter.name) ?? '';

      if (!value) {
        return;
      }

      const option = filter.options.find((item) => item.value === value);

      if (option) {
        items.push({ name: filter.name, label: filter.label, value: option.label });
      }
    });

    return items;
  }, [categories, cities, currentCategory, currentCity, currentQ, extraFilters, searchParams]);

  const hasActiveFilters = activeFilters.length > 0;

  const filterFields = (
    <>
      {categories.length > 0 ? (
        <div className="w-full">
          <Select className={fieldClassName()} value={currentCategory} onChange={(e) => handleFilter('category', e.target.value)}>
            <option value="">Все категории</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.slug}>
                {cat.name}
              </option>
            ))}
          </Select>
        </div>
      ) : null}

      {cities.length > 0 ? (
        <div className="w-full">
          <Select className={fieldClassName()} value={currentCity} onChange={(e) => handleFilter('city', e.target.value)}>
            <option value="">Все города</option>
            {cities.map((city) => (
              <option key={city.id} value={city.slug}>
                {city.name}
              </option>
            ))}
          </Select>
        </div>
      ) : null}

      {extraFilters.map((filter) => {
        const currentValue = searchParams?.get(filter.name) ?? '';

        return (
          <div className="w-full" key={filter.name}>
            <Select className={fieldClassName()} aria-label={filter.label} value={currentValue} onChange={(e) => handleFilter(filter.name, e.target.value)}>
              <option value="">{filter.allLabel ?? filter.label}</option>
              {filter.options.map((option) => (
                <option key={`${filter.name}-${option.value}`} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          </div>
        );
      })}
    </>
  );

  const content = (
    <div className={cn('grid gap-3', embedded ? '' : 'container')}>
      <Panel className="border-black/10 bg-[rgba(255,249,243,0.78)]" padding="md">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--muted)]" size={17} />
          <Input
            className={cn(fieldClassName(), 'pl-10')}
            onChange={(e) => setDraftQuery(e.target.value)}
            placeholder={placeholder}
            type="search"
            value={draftQuery}
          />
        </div>
      </Panel>

      {hasFilters ? (
        <Panel className="border-black/10 bg-[rgba(255,250,244,0.82)]" padding="md">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">Фильтры</p>
              <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                {hasActiveFilters ? `Сейчас выбрано: ${activeFilters.length}.` : 'Город, категория и формат.'}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {hasActiveFilters ? (
                <button
                  className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--accent)] transition-colors hover:text-[var(--accent-strong)]"
                  onClick={clearAllFilters}
                  type="button"
                >
                  <RotateCcw size={14} />
                  Сбросить
                </button>
              ) : null}
              {embedded ? (
                <button
                  aria-expanded={showFilters}
                  className="inline-flex items-center gap-2 rounded-full border border-black/10 px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--text)] transition hover:border-black/20 md:hidden"
                  onClick={() => setShowFilters((value) => !value)}
                  type="button"
                >
                  <SlidersHorizontal size={14} />
                  Фильтры
                  <ChevronDown className={cn('transition-transform duration-300', showFilters && 'rotate-180')} size={14} />
                </button>
              ) : null}
            </div>
          </div>

          {hasActiveFilters ? (
            <div className="mt-4 flex flex-wrap gap-2">
              {activeFilters.map((filter) => (
                <button
                  className="inline-flex max-w-full items-center gap-2 rounded-full border border-[rgba(101,32,27,0.18)] bg-[rgba(101,32,27,0.05)] px-3 py-1.5 text-[11px] leading-5 text-[var(--accent)] transition hover:border-[rgba(101,32,27,0.28)] hover:bg-[rgba(101,32,27,0.08)]"
                  key={`${filter.name}-${filter.value}`}
                  onClick={() => clearSingleFilter(filter.name)}
                  type="button"
                >
                  <span className="font-semibold uppercase tracking-[0.12em]">{filter.label}</span>
                  <span className="break-words text-[var(--text)]">{filter.value}</span>
                  <X size={12} />
                </button>
              ))}
            </div>
          ) : null}

          <div
            className={cn(
              'mt-4 gap-2.5',
              embedded ? 'hidden md:grid' : 'grid md:grid-cols-2 xl:grid-cols-4',
              embedded && showFilters && 'grid',
              embedded && !showFilters && 'md:grid'
            )}
          >
            {filterFields}
          </div>

          {isPending ? (
            <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">Обновляем список…</p>
          ) : null}
        </Panel>
      ) : null}
    </div>
  );

  if (embedded) {
    return content;
  }

  return (
    <section className="border-b border-black/10 bg-[var(--surface-muted)] py-6">
      {content}
    </section>
  );
}
