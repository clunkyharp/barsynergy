'use client';

import { useEffect, useTransition, useState, useCallback, type ChangeEvent } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search } from 'lucide-react';
import { Select } from '@/components/ui/select';
import type { PublicTaxonomyOption, PublicSelectOption } from '@/lib/public/filter-options';

const educationSortOptions = [
  { value: 'recent', label: 'Сначала новые' },
  { value: 'name', label: 'По названию' }
] as const;

type EducationFilterBarProps = {
  categories: PublicTaxonomyOption[];
  cities: PublicTaxonomyOption[];
  formats: PublicSelectOption[];
  levels: PublicSelectOption[];
  basePath: string;
};

function buildNextUrl(
  basePath: string,
  current: URLSearchParams,
  updates: Record<string, string>
): string {
  const params = new URLSearchParams(current.toString());
  for (const [key, value] of Object.entries(updates)) {
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
  }
  params.delete('page');
  const query = params.toString();
  return query ? `${basePath}?${query}` : basePath;
}

function EducationFilterBarContent({
  categories,
  cities,
  formats,
  levels,
  basePath
}: EducationFilterBarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  const currentQ = searchParams.get('q') ?? '';
  const currentCity = searchParams.get('city') ?? '';
  const currentFormat = searchParams.get('format') ?? '';
  const currentLevel = searchParams.get('level') ?? '';
  const currentCategory = searchParams.get('category') ?? '';
  const currentSort = searchParams.get('sort') ?? '';

  const [searchValue, setSearchValue] = useState(currentQ);

  useEffect(() => {
    setSearchValue(currentQ);
  }, [currentQ]);

  const navigate = useCallback(
    (updates: Record<string, string>) => {
      const url = buildNextUrl(basePath, searchParams, updates);
      startTransition(() => {
        router.push(url, { scroll: false });
      });
    },
    [basePath, router, searchParams]
  );

  useEffect(() => {
    if (searchValue === currentQ) return;
    const id = window.setTimeout(() => {
      navigate({ q: searchValue });
    }, 300);
    return () => window.clearTimeout(id);
  }, [searchValue, currentQ, navigate]);

  function handleSelectChange(name: string) {
    return (e: ChangeEvent<HTMLSelectElement>) => {
      navigate({ [name]: e.target.value });
    };
  }

  const activePillCls = 'inline-flex shrink-0 items-center rounded-full border border-[var(--accent)] bg-[var(--accent)] px-3.5 py-1.5 text-[13px] font-semibold text-[var(--accent-contrast)]';
  const inactivePillCls = 'inline-flex shrink-0 items-center rounded-full border border-[var(--border-subtle)] bg-[var(--surface-wash)] px-3.5 py-1.5 text-[13px] font-semibold text-[var(--text-secondary)] transition-colors hover:bg-[var(--surface-muted)]';

  return (
    <div className="border-b border-[var(--line)] bg-[var(--surface)]">
      <div className="container py-4">
        {/* Bordered panel that groups all filter controls — matches reference */}
        <div className="overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--surface-card)] p-2 shadow-[var(--shadow-sm)] sm:p-2.5">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            {/* Search input */}
            <div className="relative min-w-0 flex-1">
              <Search
                aria-hidden="true"
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]"
                size={16}
                strokeWidth={1.8}
              />
              <input
                autoComplete="off"
                className="field-base min-h-[2.75rem] w-full pl-10 text-sm"
                name="q"
                onChange={(e) => setSearchValue(e.target.value)}
                placeholder="Найти курс или программу"
                spellCheck={false}
                type="text"
                value={searchValue}
              />
            </div>

            <div className="sm:min-w-[8.5rem]">
              <Select
                aria-label="Формат"
                className="min-h-[2.75rem] text-sm"
                name="format"
                onChange={handleSelectChange('format')}
                value={currentFormat}
              >
                <option value="">Формат</option>
                {formats.map((fmt) => (
                  <option key={fmt.value} value={fmt.value}>{fmt.label}</option>
                ))}
              </Select>
            </div>

            <div className="sm:min-w-[8.5rem]">
              <Select
                aria-label="Уровень"
                className="min-h-[2.75rem] text-sm"
                name="level"
                onChange={handleSelectChange('level')}
                value={currentLevel}
              >
                <option value="">Уровень</option>
                {levels.map((lvl) => (
                  <option key={lvl.value} value={lvl.value}>{lvl.label}</option>
                ))}
              </Select>
            </div>

            <div className="sm:min-w-[8.5rem]">
              <Select
                aria-label="Город"
                className="min-h-[2.75rem] text-sm"
                name="city"
                onChange={handleSelectChange('city')}
                value={currentCity}
              >
                <option value="">Город</option>
                {cities.map((city) => (
                  <option key={city.id} value={city.slug}>{city.name}</option>
                ))}
              </Select>
            </div>

            <div className="sm:min-w-[9rem]">
              <Select
                aria-label="Сортировка"
                className="min-h-[2.75rem] text-sm"
                name="sort"
                onChange={handleSelectChange('sort')}
                value={currentSort}
              >
                <option value="">По умолчанию</option>
                {educationSortOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </Select>
            </div>

            <button
              className="min-h-[2.75rem] shrink-0 rounded-[var(--radius-md)] bg-[var(--accent)] px-6 text-sm font-semibold whitespace-nowrap text-[var(--accent-contrast)] transition-opacity hover:opacity-90"
              onClick={() => navigate({ q: searchValue })}
              type="button"
            >
              Найти
            </button>
          </div>
        </div>

        {categories.length > 0 ? (
          <div className="mt-3 flex items-center gap-2 overflow-x-auto pb-0.5 scrollbar-none">
            <a
              className={!currentCategory ? activePillCls : inactivePillCls}
              href={buildNextUrl(basePath, searchParams, { category: '' })}
            >
              Все
            </a>
            {categories.map((cat) => (
              <a
                className={currentCategory === cat.slug ? activePillCls : inactivePillCls}
                href={buildNextUrl(basePath, searchParams, { category: cat.slug })}
                key={cat.slug}
              >
                {cat.name}
              </a>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}

export function EducationFilterBar(props: EducationFilterBarProps) {
  return <EducationFilterBarContent {...props} />;
}
