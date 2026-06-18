import { Search } from 'lucide-react';
import { AppLink } from '@/components/ui/app-link';
import { PublicBreadcrumbs } from '@/components/public/public-primitives';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { displayFont } from '@/lib/fonts';
import type { PublicTaxonomyOption, PublicSelectOption } from '@/lib/public/filter-options';
import { cn } from '@/lib/utils';

export function EventsHeroSection() {
  return (
    <section
      className="background-zone background-zone-graphite relative overflow-hidden border-b border-[var(--line)]"
      style={{
        backgroundImage: [
          'linear-gradient(105deg, rgba(10,9,8,0.90) 0%, rgba(12,11,9,0.72) 50%, rgba(10,9,8,0.52) 100%)',
          'url("/images/events-hero.jpg")'
        ].join(', '),
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      <div className="container">
        <div className="flex min-h-[360px] max-w-xl flex-col pt-4 pb-10 md:min-h-[400px] md:pt-4 md:pb-14">
          <PublicBreadcrumbs current="События" />
          <h1 className={`${displayFont.className} mt-3 text-[clamp(2.4rem,5.5vw,4.2rem)] font-semibold leading-[1.20] text-balance text-[var(--text)]`}>
            События
          </h1>
          <p className="mt-4 text-[15px] leading-7 text-[var(--muted)]">
            Каппинги, чемпионаты, лекции, мастер-классы<br className="hidden sm:block" />
            и встречи кофейного сообщества.
          </p>
        </div>
      </div>
    </section>
  );
}

type EventsSearchBarProps = {
  cities: PublicTaxonomyOption[];
  formats: PublicSelectOption[];
  selectedQ?: string;
  selectedCity?: string;
  selectedFormat?: string;
  selectedPeriod?: string;
};

const CITY_TAB_NAMES = ['Махачкала', 'Грозный', 'Владикавказ', 'Нальчик'] as const;

function buildEventsFilterHref({
  city,
  format,
  period,
  q
}: {
  city?: string;
  format?: string;
  period?: string;
  q?: string;
}) {
  const params = new URLSearchParams();

  if (q) params.set('q', q);
  if (city) params.set('city', city);
  if (format) params.set('format', format);
  if (period) params.set('period', period);

  const query = params.toString();
  return query ? `/events?${query}` : '/events';
}

export function EventsSearchBar({ cities, formats, selectedQ, selectedCity, selectedFormat, selectedPeriod }: EventsSearchBarProps) {
  const preferredCityTabs = CITY_TAB_NAMES
    .map((name) => cities.find((city) => city.name === name))
    .filter((city): city is PublicTaxonomyOption => Boolean(city));
  const extraCityTabs = cities.filter((city) => !preferredCityTabs.some((tab) => tab.slug === city.slug));
  const cityTabs = [...preferredCityTabs, ...extraCityTabs].slice(0, 5);

  return (
    <section className="background-zone background-zone-graphite border-b border-[var(--line)] py-4">
      <div className="container space-y-3">
        <nav aria-label="Города событий" className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          <AppLink
            className={cn(
              'shrink-0 rounded-full border px-4 py-2 text-sm font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]',
              !selectedCity
                ? 'border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent)]'
                : 'border-[var(--border-default)] bg-[var(--surface-card)] text-[var(--muted)] hover:text-[var(--text)]'
            )}
            href={buildEventsFilterHref({ format: selectedFormat, period: selectedPeriod, q: selectedQ })}
          >
            Все
          </AppLink>
          {cityTabs.map((city) => (
            <AppLink
              className={cn(
                'shrink-0 rounded-full border px-4 py-2 text-sm font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]',
                selectedCity === city.slug
                  ? 'border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent)]'
                  : 'border-[var(--border-default)] bg-[var(--surface-card)] text-[var(--muted)] hover:text-[var(--text)]'
              )}
              href={buildEventsFilterHref({ city: city.slug, format: selectedFormat, period: selectedPeriod, q: selectedQ })}
              key={city.slug}
            >
              {city.name}
            </AppLink>
          ))}
        </nav>
        <form action="/events" className="flex flex-col gap-3 sm:flex-row sm:items-center" method="GET">
          {selectedPeriod ? <input name="period" type="hidden" value={selectedPeriod} /> : null}
          <div className="relative flex-1">
            <Search
              aria-hidden="true"
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]"
              size={16}
              strokeWidth={1.8}
            />
            <input
              aria-label="Поиск событий"
              autoComplete="off"
              className="field-base min-h-[2.75rem] w-full pl-10 text-sm"
              defaultValue={selectedQ}
              name="q"
              placeholder="Найти событие"
              spellCheck={false}
              type="text"
            />
          </div>

          <div className="sm:min-w-[9rem]">
            <Select
              aria-label="Город"
              className="min-h-[2.75rem] text-sm"
              defaultValue={selectedCity ?? ''}
              name="city"
            >
              <option value="">Город</option>
              {cities.map((city) => (
                <option key={city.id} value={city.slug}>{city.name}</option>
              ))}
            </Select>
          </div>

          <div className="sm:min-w-[9rem]">
            <Select
              aria-label="Формат"
              className="min-h-[2.75rem] text-sm"
              defaultValue={selectedFormat ?? ''}
              name="format"
            >
              <option value="">Формат</option>
              {formats.map((fmt) => (
                <option key={fmt.value} value={fmt.value}>{fmt.label}</option>
              ))}
            </Select>
          </div>

          <Button className="min-h-[2.75rem] shrink-0 px-6 whitespace-nowrap" type="submit">
            Найти
          </Button>
        </form>
      </div>
    </section>
  );
}
