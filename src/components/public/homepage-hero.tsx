import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { PublicEyebrow } from "@/components/public/public-primitives";
import { Button } from "@/components/ui/button";
import { accentFont, displayFont } from "@/lib/fonts";
import type { HomepageData } from "@/lib/public/home";

function pluralRu(n: number, one: string, few: string, many: string): string {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return one;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return few;
  return many;
}

const fallbackTrustMarkers = [
  "Специалисты и команды СКФО",
  "Вакансии, обучение и события",
  "Поставщики, материалы и заявки",
] as const;

const audienceRoutes = [
  {
    title: "Я специалист",
    description:
      "Найти работу, обучение и материалы по теме для роста в барной индустрии.",
    primaryLabel: "Смотреть вакансии",
    primaryHref: "/vacancies",
    secondaryLabel: "Создать профиль",
    secondaryHref: "/auth/register/user",
  },
  {
    title: "У меня компания",
    description: "Каталог заведений и рабочий кабинет для команды.",
    primaryLabel: "Открыть для бизнеса",
    primaryHref: "/business",
    secondaryLabel: "Запросить бизнес-доступ",
    secondaryHref: "/auth/register",
  },
] as const;

function HomeStatsLine({ stats }: { stats: HomepageData["stats"] }) {
  const allItems = [
    {
      value: stats.vacancies,
      label: pluralRu(stats.vacancies, "вакансия", "вакансии", "вакансий"),
    },
    {
      value: stats.suppliers,
      label: pluralRu(
        stats.suppliers,
        "поставщик",
        "поставщика",
        "поставщиков",
      ),
    },
    {
      value: stats.articles,
      label: pluralRu(stats.articles, "материал", "материала", "материалов"),
    },
  ];
  const statItems = allItems.filter((item) => item.value > 0);

  if (statItems.length < 2) {
    return (
      <div className="mt-10">
        <p className="text-[10px] font-semibold uppercase tracking-[var(--tracking-eyebrow-md)] text-[var(--editorial-dark-label)]">
          Что уже есть на платформе
        </p>
        <ul className="mt-4 flex flex-wrap gap-2.5">
          {fallbackTrustMarkers.map((item) => (
            <li
              className="rounded-[var(--radius-pill)] border border-[var(--editorial-dark-border)] bg-[rgba(255,253,249,0.08)] px-3 py-2 text-[12px] leading-5 text-[var(--editorial-dark-text)]"
              key={item}
            >
              {item}
            </li>
          ))}
        </ul>
      </div>
    );
  }

  return (
    <dl className="mt-10 flex flex-wrap gap-x-8 gap-y-4 text-[12px] text-[rgba(255,253,249,0.66)] md:gap-x-12">
      {statItems.map((item) => (
        <div className="flex items-baseline gap-2.5" key={item.label}>
          <dd
            aria-label={`${item.value} ${item.label}`}
            className="order-1 text-[2.4rem] font-bold leading-none tabular-nums text-[var(--editorial-dark-text)] md:text-[3rem]"
          >
            {item.value}
          </dd>
          <dt className="order-2 uppercase tracking-[var(--tracking-eyebrow-sm)] text-[var(--editorial-dark-muted)]">
            {item.label}
          </dt>
        </div>
      ))}
    </dl>
  );
}

function HomeAudienceRoutes() {
  return (
    <div className="mt-8">
      <p className="text-[10px] font-semibold uppercase tracking-[var(--tracking-eyebrow-md)] text-[var(--editorial-dark-label)]">
        Выберите свою роль
      </p>
      <div className="mt-4 grid gap-3 md:grid-cols-2">
        {audienceRoutes.map((route) => (
          <article
            className="flex flex-col rounded-[var(--radius-lg)] border border-[var(--editorial-dark-border)] bg-[rgba(18,14,12,0.54)] p-4 backdrop-blur-[10px]"
            key={route.title}
          >
            <h2 className="text-[1.05rem] font-semibold leading-tight text-[var(--editorial-dark-text)]">
              {route.title}
            </h2>
            <p className="mt-2 text-sm leading-6 text-[var(--editorial-dark-muted)]">
              {route.description}
            </p>
            <div className="mt-auto flex flex-col gap-2 pt-4 sm:flex-row sm:flex-wrap">
              <Button
                className="min-h-11 rounded-[var(--radius-sm)] px-5 text-[12px] uppercase tracking-[var(--tracking-eyebrow-sm)]"
                href={route.primaryHref}
              >
                {route.primaryLabel}
              </Button>
              <Button
                className="min-h-11 px-3 text-[12px] uppercase tracking-[var(--tracking-eyebrow-sm)]"
                href={route.secondaryHref}
                variant="on-dark"
              >
                {route.secondaryLabel}
                <ArrowUpRight aria-hidden="true" size={15} strokeWidth={1.8} />
              </Button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

export function HomeHeroRouter({ stats }: { stats: HomepageData["stats"] }) {
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
        <div className="max-w-[58rem]">
          <PublicEyebrow
            className={`${accentFont.className} tracking-[var(--tracking-eyebrow-md)]`}
            tone="inverse"
          >
            BARSYNERGY / Кофейная индустрия СКФО
          </PublicEyebrow>
          <h1
            className={`${displayFont.className} mt-4 max-w-[44rem] text-[clamp(2.8rem,5vw,4.8rem)] font-semibold leading-[1.20] text-balance text-[var(--editorial-dark-text)] max-[640px]:max-w-[15ch] max-[640px]:text-[clamp(2.25rem,9.6vw,2.55rem)]`}
            id="home-hero-title"
          >
            Платформа кофейной индустрии СКФО
          </h1>
          <p className="mt-5 max-w-2xl text-[15px] leading-7 text-[var(--editorial-dark-muted)] md:text-base">
            обучение, вакансии, поставщики, события и инструменты для бариста,
            команд и заведений региона.
          </p>
          <HomeAudienceRoutes />
          <HomeStatsLine stats={stats} />
        </div>
      </div>
    </section>
  );
}
