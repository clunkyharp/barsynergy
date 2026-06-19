import { Search } from 'lucide-react';
import { CategoryPill } from '@/components/public/article-grid-category-pill';
import { ChipFilterRow } from '@/components/ui/chip-filter-row';
import { PublicBreadcrumbs } from '@/components/public/public-primitives';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { displayFont } from '@/lib/fonts';
import type { PublicTaxonomyOption, PublicSelectOption } from '@/lib/public/filter-options';

type EventCityTabsProps = {
  cities: PublicTaxonomyOption[];
  selectedCity?: string;
  preserve?: { q?: string; format?: string; period?: string };
};

export function EventCityTabs({ cities, selectedCity, preserve }: EventCityTabsProps) {
  if (cities.length === 0) {
    return null;
  }

  const buildHref = (citySlug?: string) => {
    const sp = new URLSearchParams();
    if (citySlug) sp.set('city', citySlug);
    if (preserve?.q) sp.set('q', preserve.q);
    if (preserve?.format) sp.set('format', preserve.format);
    if (preserve?.period) sp.set('period', preserve.period);
    const qs = sp.toString();
    return qs ? `/events?${qs}` : '/events';
  };

  return (
    <nav
      aria-label="Города"
      className="background-zone background-zone-graphite border-b border-[var(--line)] py-4"
    >
      <div className="container">
        <ChipFilterRow aria-label="Города">
          <CategoryPill active={!selectedCity} href={buildHref()}>Все города</CategoryPill>
          {cities.map((city) => (
            <CategoryPill active={selectedCity === city.slug} href={buildHref(city.slug)} key={city.id}>
              {city.name}
            </CategoryPill>
          ))}
        </ChipFilterRow>
      </div>
    </nav>
  );
}

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
  formats: PublicSelectOption[];
  selectedQ?: string;
  selectedCity?: string;
  selectedFormat?: string;
  selectedPeriod?: string;
};

export function EventsSearchBar({ formats, selectedQ, selectedCity, selectedFormat }: EventsSearchBarProps) {
  return (
    <section className="background-zone background-zone-graphite border-b border-[var(--line)] py-4">
      <div className="container">
        <form action="/events" className="flex flex-col gap-3 sm:flex-row sm:items-center" method="GET">
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

          <input defaultValue={selectedCity ?? ''} name="city" type="hidden" />

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

