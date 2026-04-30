'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useTransition } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { MetaChip } from '@/components/ui/meta-chip';
import { Panel } from '@/components/ui/panel';
import { Select } from '@/components/ui/select';

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

export function PublicFilters({
  categories = [],
  cities = [],
  embedded = false,
  extraFilters = [],
  placeholder = 'Поиск по названию...'
}: PublicFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [draftQuery, setDraftQuery] = useState('');

  const currentQ = searchParams?.get('q') ?? '';
  const currentCategory = searchParams?.get('category') ?? '';
  const currentCity = searchParams?.get('city') ?? '';
  const hasFilters = categories.length > 0 || cities.length > 0 || extraFilters.length > 0;

  useEffect(() => {
    setDraftQuery(currentQ);
  }, [currentQ]);

  function pushParams(params: URLSearchParams) {
    const query = params.toString();
    const nextPath = pathname ?? '/';

    startTransition(() => {
      router.push(query ? `${nextPath}?${query}` : nextPath, { scroll: false });
    });
  }

  function handleFilter(name: string, value: string) {
    const params = new URLSearchParams(searchParams?.toString() ?? '');

    if (value) {
      params.set(name, value);
    } else {
      params.delete(name);
    }

    params.delete('page');
    pushParams(params);
  }

  useEffect(() => {
    const normalizedDraft = draftQuery.trim();
    const normalizedCurrent = currentQ.trim();

    if (normalizedDraft === normalizedCurrent) {
      return;
    }

    const timerId = window.setTimeout(() => {
      handleFilter('q', normalizedDraft);
    }, 300);

    return () => {
      window.clearTimeout(timerId);
    };
  }, [draftQuery, currentQ, pathname, router, searchParams]);

  const content = (
    <div className={embedded ? 'grid gap-4' : 'container grid gap-4 xl:grid-cols-[18rem_minmax(0,1fr)]'}>
        <Panel className={embedded ? '' : 'xl:col-span-2'} padding="md">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--muted)]" size={18} />
            <Input
              className="pl-10"
              onChange={(e) => setDraftQuery(e.target.value)}
              placeholder={placeholder}
              value={draftQuery}
              type="search"
            />
          </div>
        </Panel>

        {hasFilters ? (
          <Panel className="flex flex-col gap-4 xl:sticky xl:top-28 xl:self-start" padding="md">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">Фильтры</p>
              <p className="mt-2 text-sm leading-6 text-[var(--muted)]">Уточните список по городу, категории и формату.</p>
            </div>

            {categories.length > 0 ? (
              <div className="w-full">
                <Select value={currentCategory} onChange={(e) => handleFilter('category', e.target.value)}>
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
                <Select value={currentCity} onChange={(e) => handleFilter('city', e.target.value)}>
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
                  <Select aria-label={filter.label} value={currentValue} onChange={(e) => handleFilter(filter.name, e.target.value)}>
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

            {isPending ? (
              <MetaChip className="gap-2 px-3 py-2" variant="selected">
                <span className="h-2 w-2 animate-ping rounded-full bg-current" />
                Обновление...
              </MetaChip>
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
