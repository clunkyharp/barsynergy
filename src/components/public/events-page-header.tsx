import { CalendarDays, Search } from 'lucide-react';
import { PublicBreadcrumbs } from '@/components/public/public-primitives';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { displayFont } from '@/lib/fonts';
import type { PublicTaxonomyOption, PublicSelectOption } from '@/lib/public/filter-options';

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
          <h1 className={`${displayFont.className} mt-3 text-[clamp(2.4rem,5.5vw,4.2rem)] font-semibold leading-none text-[var(--text)]`}>
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
};

export function EventsSearchBar({ cities, formats, selectedQ, selectedCity, selectedFormat }: EventsSearchBarProps) {
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
export function EventsCtaBanner() {
  return (
    <section className="background-zone background-zone-graphite border-b border-[var(--line)] py-12 md:py-16">
      <div className="container">
        <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:text-left">
          <div className="grid h-12 w-12 shrink-0 place-items-center rounded-[var(--radius-md)] bg-[var(--accent-soft)] text-[var(--accent)]">
            <CalendarDays size={24} strokeWidth={1.5} />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className={`${displayFont.className} text-[1.3rem] font-semibold leading-tight text-[var(--text)] md:text-[1.5rem]`}>
              Хотите добавить событие?
            </h2>
            <p className="mt-1 text-[14px] leading-6 text-[var(--muted)]">
              Расскажите кофейному сообществу о вашем мероприятии.
            </p>
          </div>
          <Button className="shrink-0 gap-2 whitespace-nowrap" href="/contacts?topic=event#contact-form">
            Добавить событие
            <CalendarDays size={16} strokeWidth={1.8} />
          </Button>
        </div>
      </div>
    </section>
  );
}
