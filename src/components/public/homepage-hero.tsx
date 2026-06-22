import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { AppLink } from "@/components/ui/app-link";
import { accentFont, displayFont } from "@/lib/fonts";
import type { HomepageData } from "@/lib/public/home";

function pluralRu(n: number, one: string, few: string, many: string): string {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return one;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return few;
  return many;
}

export function HomeHeroRouter({ stats }: { stats: HomepageData["stats"] }) {
  const allItems = [
    {
      value: stats.vacancies,
      label: pluralRu(stats.vacancies, "вакансия", "вакансии", "вакансий"),
    },
    {
      value: stats.suppliers,
      label: pluralRu(stats.suppliers, "поставщик", "поставщика", "поставщиков"),
    },
    {
      value: stats.articles,
      label: pluralRu(stats.articles, "материал", "материала", "материалов"),
    },
  ];
  const statItems = allItems.filter((item) => item.value >= 1);

  return (
    <section
      aria-labelledby="home-hero-title"
      className="relative isolate flex items-center justify-center overflow-hidden border-b border-[var(--line)] bg-[var(--editorial-dark-surface)] text-[var(--editorial-dark-text)] md:min-h-[720px] lg:min-h-[760px]"
    >
      <div className="absolute inset-0 z-0">
        <Image
          alt="Бариста наливает молоко в чашку кофе"
          className="object-cover object-[center_35%]"
          fill
          priority
          sizes="100vw"
          src="/images/home/hero-coffee-pour.png"
        />
      </div>
      <div
        aria-hidden="true"
        className="home-hero-gradient absolute inset-0 z-[1]"
      />
      <div className="container relative z-[2] py-20 md:py-32">
        <div className="mx-auto flex max-w-[52rem] flex-col items-center text-center">
          <span
            className={`${accentFont.className} inline-flex items-center gap-1.5 rounded-[var(--radius-pill)] bg-[var(--brand-soft)] px-4 py-1.5 text-[0.78rem] font-semibold tracking-[var(--tracking-eyebrow-sm)] text-[var(--accent)]`}
          >
            BARSYNERGY / Кофейная индустрия СКФО
          </span>
          <h1
            className={`${displayFont.className} mt-6 text-[clamp(2.2rem,6vw,4rem)] font-bold tracking-[-0.03em] leading-[1.08] text-balance text-[var(--editorial-dark-text)]`}
            id="home-hero-title"
          >
            Платформа, которая объединяет людей индустрии{" "}
            <span className="text-[var(--accent)]">кофе и бара</span>
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-base leading-7 text-[var(--editorial-dark-text)] md:text-[1.1rem]">
            Люди, события, вакансии, поставщики, обучение и материалы СКФО,
            которые помогают работать точнее.
          </p>
          <div className="mt-9 flex flex-wrap justify-center gap-3 max-sm:w-full max-sm:flex-col max-sm:items-stretch">
            <AppLink
              href="/vacancies"
              className="inline-flex items-center justify-center gap-2 rounded-[var(--radius-lg)] bg-[var(--accent)] px-6 py-3 text-sm font-semibold text-[var(--accent-contrast)] shadow-[var(--shadow-action)] transition-colors hover:bg-[var(--accent-strong)]"
            >
              Смотреть вакансии
              <ArrowUpRight size={15} strokeWidth={2} />
            </AppLink>
            <AppLink
              href="/business"
              className="inline-flex items-center justify-center gap-2 rounded-[var(--radius-lg)] border border-white/30 px-6 py-3 text-sm font-semibold text-[var(--editorial-dark-text)] transition-colors hover:border-white/60 hover:bg-white/10"
            >
              Для бизнеса
            </AppLink>
          </div>
          {statItems.length >= 2 && (
            <dl className="mt-14 flex flex-wrap justify-center gap-x-12 gap-y-6">
              {statItems.map((item) => (
                <div className="flex flex-col items-center" key={item.label}>
                  <dd
                    aria-label={`${item.value} ${item.label}`}
                    className={`${displayFont.className} text-[1.75rem] font-bold leading-none tabular-nums text-[var(--accent)]`}
                  >
                    {item.value}
                  </dd>
                  <dt className="mt-1.5 text-[0.85rem] font-medium text-[var(--editorial-dark-muted)]">
                    {item.label}
                  </dt>
                </div>
              ))}
            </dl>
          )}
        </div>
      </div>
    </section>
  );
}
