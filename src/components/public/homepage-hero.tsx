import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { PublicEyebrow } from "@/components/public/public-primitives";
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
      className="relative isolate flex max-md:items-start md:items-center overflow-hidden border-b border-[var(--line)] bg-[var(--editorial-dark-surface)] text-[var(--editorial-dark-text)] md:min-h-[720px] lg:min-h-[760px]"
    >
      <div className="absolute inset-0 z-0">
        <Image
          alt="Кофейный бар с эспрессо-машиной и полками"
          className="object-cover object-[center_52%] saturate-[0.94] contrast-[1.02]"
          fill
          priority
          sizes="100vw"
          src="/images/home/hero-coffee-counter-haberdoedas.jpg"
        />
      </div>
      <div
        aria-hidden="true"
        className="home-hero-gradient absolute inset-0 z-[1]"
      />
      <div className="container relative z-[2] py-16 md:py-32">
        <div className="max-w-[96rem]">
          <PublicEyebrow
            className={`${accentFont.className} tracking-[var(--tracking-eyebrow-md)]`}
            tone="inverse"
          >
            BARSYNERGY / Кофейная индустрия СКФО
          </PublicEyebrow>
          <h1
            className={`${displayFont.className} mt-4 max-w-[18ch] text-[clamp(2.6rem,4.6vw,5.4rem)] font-semibold tracking-[-0.01em] leading-[0.96] text-balance text-[var(--editorial-dark-text)] max-[640px]:max-w-[13ch] max-[640px]:text-[clamp(2.2rem,9vw,3.2rem)]`}
            id="home-hero-title"
          >
            Платформа, которая объединяет людей индустрии кофе и бара
          </h1>
          <p className="mt-5 max-w-2xl text-[15px] leading-7 text-[var(--editorial-dark-muted)] md:text-base">
            Люди, события, вакансии, поставщики, обучение и материалы СКФО,
            которые помогают работать точнее.
          </p>
          <div className="mt-8 flex flex-wrap gap-3 max-sm:flex-col max-sm:items-start">
            <a
              href="/vacancies"
              className="inline-flex items-center gap-2 rounded-[var(--radius-md)] bg-[var(--accent)] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[var(--accent-strong)] max-sm:w-full max-sm:justify-center"
            >
              Смотреть вакансии
              <ArrowUpRight size={15} strokeWidth={2} />
            </a>
            <a
              href="/business"
              className="inline-flex items-center gap-2 rounded-[var(--radius-md)] border border-white/30 px-5 py-2.5 text-sm font-semibold text-[var(--editorial-dark-text)] transition-colors hover:border-white/60 hover:bg-white/8 max-sm:w-full max-sm:justify-center"
            >
              Для бизнеса
            </a>
          </div>
          {statItems.length >= 2 && (
            <dl className="mt-12 flex flex-wrap gap-x-8 gap-y-4 md:gap-x-12">
              <p className="w-full text-[10px] font-semibold uppercase tracking-[var(--tracking-eyebrow-md)] text-[var(--editorial-dark-muted)]">
                Платформа в цифрах
              </p>
              {statItems.map((item) => (
                <div className="flex items-baseline gap-2.5" key={item.label}>
                  <dd
                    aria-label={`${item.value} ${item.label}`}
                    className="order-1 text-[2.4rem] font-bold leading-none tabular-nums text-[var(--editorial-dark-text)] md:text-[3rem]"
                  >
                    {item.value}
                  </dd>
                  <dt className="order-2 text-[12px] uppercase tracking-[var(--tracking-eyebrow-sm)] text-[var(--editorial-dark-muted)]">
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
