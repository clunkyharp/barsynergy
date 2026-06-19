import Image from "next/image";
import { ArrowUpRight, BriefcaseBusiness, UserRound } from "lucide-react";
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

const audienceRoutes = [
  {
    title: "Я специалист",
    description:
      "Вакансии, обучение, события и материалы для роста в кофейной и барной индустрии.",
    primaryLabel: "Смотреть вакансии",
    primaryHref: "/vacancies",
    secondaryLabel: "Создать профиль",
    secondaryHref: "/auth/register/user",
  },
  {
    title: "У меня компания",
    description:
      "Поставщики, вакансии, размещение, партнёрства и инструменты для заведений и брендов.",
    primaryLabel: "Открыть для бизнеса",
    primaryHref: "/business",
    secondaryLabel: "Смотреть поставщиков",
    secondaryHref: "/suppliers",
  },
] as const;



export function HomeStatsSection({ stats }: { stats: HomepageData["stats"] }) {
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
  const statItems = allItems.filter((item) => item.value >= 1);

  if (statItems.length < 2) {
    return null;
  }

  return (
    <section className="border-b border-[var(--line)] bg-[var(--surface-wash)] py-8 md:py-10">
      <div className="container">
        <p className="text-[10px] font-semibold uppercase tracking-[var(--tracking-eyebrow-md)] text-[var(--muted)]">
          Платформа в цифрах
        </p>
        <dl className="mt-4 flex flex-wrap gap-x-8 gap-y-4 text-[12px] text-[var(--muted)] md:gap-x-12">
          {statItems.map((item) => (
            <div className="flex items-baseline gap-2.5" key={item.label}>
              <dd
                aria-label={`${item.value} ${item.label}`}
                className="order-1 text-[2.4rem] font-bold leading-none tabular-nums text-[var(--text)] md:text-[3rem]"
              >
                {item.value}
              </dd>
              <dt className="order-2 uppercase tracking-[var(--tracking-eyebrow-sm)] text-[var(--muted)]">
                {item.label}
              </dt>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}

export function HomeAudienceSection() {
  const routes = audienceRoutes;

  return (
    <section className="border-b border-[var(--line)] bg-[var(--surface-wash)] py-10 md:py-14">
      <div className="container">
        <p className="text-[10px] font-semibold uppercase tracking-[var(--tracking-eyebrow-md)] text-[var(--muted)]">
          Выберите свою роль
        </p>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {routes.map((route) => {
            const Icon = route.title.includes("специалист") ? UserRound : BriefcaseBusiness;
            return (
              <a
                key={route.title}
                href={route.primaryHref}
                className="group block rounded-[var(--radius-lg)] border border-[var(--line)] bg-[var(--surface)] p-5 transition-colors hover:border-[var(--accent)]/24"
              >
                <Icon
                  className="mb-3 text-[var(--accent)]"
                  size={22}
                  strokeWidth={1.8}
                />
                <h2 className="text-[1.05rem] font-semibold leading-tight text-[var(--text)]">
                  {route.title}
                </h2>
                <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                  {route.description}
                </p>
                <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--accent)] transition-colors group-hover:text-[var(--accent-strong)]">
                  {route.primaryLabel}
                  <ArrowUpRight size={15} strokeWidth={2} />
                </span>
              </a>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export function HomeHeroRouter() {
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
            className={`${displayFont.className} mt-4 max-w-[18ch] text-[clamp(2.6rem,4.6vw,5.4rem)] font-normal leading-[0.96] text-balance text-[var(--editorial-dark-text)] max-[640px]:max-w-[13ch] max-[640px]:text-[clamp(2.2rem,9vw,3.2rem)]`}
            id="home-hero-title"
          >
            Платформа, которая объединяет людей индустрии кофе и бара
          </h1>
          <p className="mt-5 max-w-2xl text-[15px] leading-7 text-[var(--editorial-dark-muted)] md:text-base">
            Люди, события, вакансии, поставщики, обучение и материалы СКФО,
            которые помогают работать точнее.
          </p>
        </div>
      </div>
    </section>
  );
}
