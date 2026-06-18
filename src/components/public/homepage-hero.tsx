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
  },
] as const;

const fallbackTrustMarkers = [
  { value: '8', label: 'разделов платформы' },
  { value: '5', label: 'регионов СКФО' },
];

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
        <dl className="mt-4 flex flex-wrap gap-x-8 gap-y-4 text-[12px] text-[rgba(255,253,249,0.66)] md:gap-x-12">
          {fallbackTrustMarkers.map((item) => (
            <div className="flex items-baseline gap-2.5" key={item.label}>
              <dd className="order-1 text-[2.4rem] font-bold leading-none tabular-nums text-[var(--editorial-dark-text)] md:text-[3rem]">
                {item.value}
              </dd>
              <dt className="order-2 uppercase tracking-[var(--tracking-eyebrow-sm)] text-[var(--editorial-dark-muted)]">
                {item.label}
              </dt>
            </div>
          ))}
        </dl>
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
  const specialist = audienceRoutes[0];
  const business = audienceRoutes[1];

  return (
    <div className="mt-8">
      <p className="text-[10px] font-semibold uppercase tracking-[var(--tracking-eyebrow-md)] text-[var(--editorial-dark-label)]">
        Выберите свою роль
      </p>
      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <article className="flex flex-col rounded-[var(--radius-lg)] border border-[var(--editorial-dark-border)] bg-[rgba(18,14,12,0.54)] p-4 backdrop-blur-[10px]">
          <h2 className="text-[1.05rem] font-semibold leading-tight text-[var(--editorial-dark-text)]">
            {specialist.title}
          </h2>
          <p className="mt-2 text-sm leading-6 text-[var(--editorial-dark-muted)]">
            {specialist.description}
          </p>
          <div className="mt-auto flex flex-col gap-2 pt-4 sm:flex-row sm:flex-wrap">
            <Button
              className="min-h-11 rounded-[var(--radius-sm)] px-5 text-[12px] uppercase tracking-[var(--tracking-eyebrow-sm)]"
              href={specialist.primaryHref}
            >
              {specialist.primaryLabel}
            </Button>
            <Button
              className="min-h-11 px-3 text-[12px] uppercase tracking-[var(--tracking-eyebrow-sm)]"
              href={specialist.secondaryHref}
              variant="on-dark"
            >
              {specialist.secondaryLabel}
              <ArrowUpRight aria-hidden="true" size={15} strokeWidth={1.8} />
            </Button>
          </div>
        </article>
        <article className="flex flex-col rounded-[var(--radius-lg)] border border-[var(--editorial-dark-border)] bg-[rgba(18,14,12,0.7)] p-4">
          <h2 className="text-[1.05rem] font-semibold leading-tight text-[var(--editorial-dark-text)]">
            {business.title}
          </h2>
          <p className="mt-2 text-sm leading-6 text-[var(--editorial-dark-muted)]">
            {business.description}
          </p>
          <div className="mt-auto flex flex-col gap-2 pt-4 sm:flex-row sm:flex-wrap">
            <Button
              className="min-h-11 rounded-[var(--radius-sm)] px-5 text-[12px] uppercase tracking-[var(--tracking-eyebrow-sm)]"
              href={business.primaryHref}
              variant="on-dark"
            >
              {business.primaryLabel}
              <ArrowUpRight aria-hidden="true" size={15} strokeWidth={1.8} />
            </Button>
          </div>
        </article>
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
            Обучение, вакансии, поставщики, события и инструменты для бариста,
            команд и заведений региона.
          </p>
          <HomeAudienceRoutes />
          <HomeStatsLine stats={stats} />
        </div>
      </div>
    </section>
  );
}
