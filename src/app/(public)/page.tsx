import Image from 'next/image';
import { ArrowUpRight, Globe, MapPin, Sparkles, Users } from 'lucide-react';
import { displayFont } from '@/lib/fonts';

const manifesto = [
  'Образование',
  'Обмен опытом',
  'Живое общение',
  'Рост бизнеса',
  'Творческий подход',
  'Сильное сообщество'
];

const values = [
  {
    title: 'Сообщество профессионалов по всему миру',
    description: 'Бармены, менеджеры, владельцы и эксперты в одном профессиональном контуре.',
    icon: Users
  },
  {
    title: 'Образовательные программы и живые интенсивы',
    description: 'Практические форматы для тех, кто усиливает навыки и систему работы.',
    icon: Sparkles
  },
  {
    title: 'Обмен идеями, опытом и вдохновением',
    description: 'Материалы, события и профессиональный диалог без шумной витрины.',
    icon: Globe
  },
  {
    title: 'Поддержка роста проектов и карьеры',
    description: 'Вакансии, партнерства, поставщики и новые точки роста для индустрии.',
    icon: ArrowUpRight
  }
];

const programs = [
  {
    title: 'Интенсивы и мастер-классы',
    description: 'Глубокое погружение в темы от лидеров индустрии.',
    image: '/images/generated/program-intensive.jpg',
    tone: 'dark'
  },
  {
    title: 'Онлайн-курсы и лекции',
    description: 'Актуальные знания в удобном формате.',
    image: '/images/generated/program-online.jpg',
    tone: 'accent'
  },
  {
    title: 'События и встречи',
    description: 'Живое общение, дискуссии и обмен опытом.',
    image: '/images/generated/program-events.jpg',
    tone: 'dark'
  }
];

const stats = [
  { value: '12K+', label: 'участников сообщества', icon: Users },
  { value: '60+', label: 'стран', icon: Globe },
  { value: '300+', label: 'городов', icon: MapPin },
  { value: '∞', label: 'возможностей для роста', icon: Sparkles }
];

const opportunities = [
  { index: '01', title: 'Поиск сотрудников' },
  { index: '02', title: 'Партнерства и коллаборации' },
  { index: '03', title: 'Продвижение проектов' },
  { index: '04', title: 'Менторство и консультации' }
];

const contentCards = [
  {
    type: 'Статья',
    title: 'Культура сервиса: что это на самом деле?',
    image: '/images/generated/content-service.jpg'
  },
  {
    type: 'Интервью',
    title: 'Разговор с командой легендарного бара',
    image: '/images/generated/content-interview.jpg'
  },
  {
    type: 'Подкаст',
    title: 'Тренды, которые меняют индустрию',
    image: '/images/generated/content-podcast.jpg'
  },
  {
    type: 'Гид',
    title: 'Как открыть бар и не закрыться в первый год',
    image: '/images/generated/content-guide.jpg'
  }
];

const partners = ['MONIN', 'DIAGEO', 'Perrier', 'LYRE’S', 'BRANDEXCHANGE', 'human robot'];

function HeroConnectionMark() {
  return (
    <svg
      aria-hidden="true"
      className="mx-auto mt-4 h-28 w-24 text-[var(--text)]"
      viewBox="0 0 96 112"
    >
      <path d="M48 8V104" stroke="currentColor" strokeOpacity="0.22" />
      <path d="M18 30H78M18 82H78" stroke="currentColor" strokeOpacity="0.22" />
      <path d="M24 86L72 26" stroke="var(--accent)" strokeWidth="2" />
      <rect height="28" width="28" fill="var(--accent)" opacity="0.94" x="34" y="16" />
      <rect height="24" width="24" fill="var(--graphite)" x="20" y="68" />
      <rect
        height="24"
        width="24"
        fill="none"
        stroke="currentColor"
        strokeOpacity="0.38"
        x="54"
        y="68"
      />
      <circle cx="48" cy="56" fill="currentColor" r="4" />
    </svg>
  );
}

function EducationCircularMark() {
  return (
    <svg
      aria-label="Учись, обменивайся, вдохновляйся"
      className="h-56 w-56 overflow-visible text-[var(--muted)]"
      role="img"
      viewBox="0 0 240 240"
    >
      <defs>
        <path id="educationCircularTextPath" d="M 120 14 A 106 106 0 1 1 119.9 14" />
      </defs>
      <circle cx="120" cy="120" fill="none" r="86" stroke="currentColor" strokeOpacity="0.24" />
      <circle cx="120" cy="120" fill="var(--accent)" r="5" />
      <text
        fill="currentColor"
        fontSize="11"
        fontWeight="700"
        letterSpacing="0.16em"
        lengthAdjust="spacing"
        textLength="640"
      >
        <textPath href="#educationCircularTextPath">
          Учись • Обменивайся • Вдохновляйся • Учись • Обменивайся • Вдохновляйся •
        </textPath>
      </text>
    </svg>
  );
}

export default function HomePage() {
  return (
    <div>
      <section className="editorial-grid border-b border-black/20">
        <div className="container py-8 md:py-12 xl:flex xl:gap-8">
          <div className="min-w-0 xl:w-[46%] xl:pr-4">
            <h1 className={`${displayFont.className} display-tight max-w-[640px] text-[44px] md:text-[60px] xl:text-[76px] 2xl:text-[82px]`}>
              <span className="block">Мы не создаем</span>
              <span className="block">тренды.</span>
              <span className="block">Мы формируем</span>
              <span className="block text-[var(--accent)]">культуру</span>
              <span className="block">гостеприимства.</span>
            </h1>
          </div>

          <div className="mt-8 grid gap-6 xl:mt-0 xl:w-[54%] xl:grid-cols-[1fr_0.24fr]">
            <div className="flex min-h-[420px] min-w-0 flex-col justify-between border-l border-black/20 pl-7 pr-6">
              <div>
                <p className={`${displayFont.className} display-face text-[44px] uppercase leading-none`}>BARSYNERGY</p>
                <p className="mt-5 max-w-[18rem] text-[19px] leading-8 sm:max-w-[34rem]">
                  Сообщество и образовательная платформа для профессионалов барной индустрии.
                </p>
                <p className="mt-7 max-w-[18rem] text-[18px] leading-8 text-[var(--muted)] sm:max-w-[34rem]">
                  Мы объединяем людей, идеи и опыт, чтобы укреплять культуру, развивать бизнес и
                  создавать будущее индустрии вместе.
                </p>
              </div>

              <div className="flex items-end justify-between gap-4">
                <a
                  className="inline-flex items-center gap-3 border-b border-[var(--text)] pb-2 text-sm font-semibold uppercase tracking-[0.06em]"
                  href="/contacts"
                >
                  Стать частью движения
                  <ArrowUpRight size={18} />
                </a>
              </div>
            </div>
            <div className="hidden border-l border-black/20 pl-4 xl:flex xl:flex-col xl:justify-between">
              <HeroConnectionMark />
              <div className="space-y-3 text-xs uppercase tracking-[0.12em] text-[var(--muted)]">
                <p>Сообщество</p>
                <p>Знания</p>
                <p>Развитие</p>
                <p>Культура</p>
              </div>
              <p className="text-xs uppercase tracking-[0.12em]">Est. 2026</p>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-black/20 bg-[var(--graphite)] text-white">
        <div className="container overflow-x-auto py-5">
          <div className="flex min-w-max items-center gap-8 text-sm font-semibold uppercase tracking-[0.06em]">
            {manifesto.map((item, index) => (
              <div className="flex items-center gap-8" key={item}>
                <span>{item}</span>
                {index < manifesto.length - 1 ? <span className="text-white/60">+</span> : null}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="editorial-grid border-b border-black/20 py-10 md:py-14">
        <div className="container grid gap-10 xl:grid-cols-[0.8fr_1.1fr_0.62fr]">
          <div>
            <h2 className={`${displayFont.className} display-tight max-w-[32rem] text-[52px] md:text-[64px] 2xl:text-[72px]`}>
              Что такое BARSYNERGY
            </h2>
          </div>

          <div>
            <p className="max-w-xl text-lg leading-8">
              BARSYNERGY — это пространство для тех, кто живет индустрией и хочет делать ее лучше.
            </p>
            <div className="mt-10 grid gap-8 md:grid-cols-2">
              {values.map((item) => {
                const Icon = item.icon;
                return (
                  <div className="grid gap-3" key={item.title}>
                    <div className="flex h-14 w-14 items-center justify-center rounded-full border border-black/25">
                      <Icon size={24} strokeWidth={1.8} />
                    </div>
                    <div>
                      <h3 className="text-base font-semibold">{item.title}</h3>
                      <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{item.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="texture-panel min-h-[220px] overflow-hidden border border-black/20 bg-[var(--graphite)]">
            <div className="grid h-full grid-cols-2">
              <div className="border-r border-white/10 bg-[url('/images/grain.svg')] opacity-70" />
              <div className="relative bg-[var(--surface)]">
                <div className="absolute inset-x-0 bottom-0 h-[55%] rounded-t-full bg-[var(--accent)] opacity-95" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="editorial-grid border-b border-black/20 py-10 md:py-14">
        <div className="container grid gap-8 xl:grid-cols-[0.86fr_1.28fr_0.34fr]">
          <div className="flex flex-col justify-between gap-8">
            <div>
              <h2 className={`${displayFont.className} display-tight max-w-[34rem] text-[52px] md:text-[64px] 2xl:text-[72px]`}>
                Образование и события
              </h2>
            </div>
            <a
              className="inline-flex w-fit items-center gap-3 border-b border-[var(--text)] pb-2 text-sm font-semibold uppercase tracking-[0.06em]"
              href="/education"
            >
              Смотреть все программы
              <ArrowUpRight size={18} />
            </a>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            {programs.map((item) => (
              <article
                className={`group border border-black/20 ${item.tone === 'accent' ? 'bg-[var(--accent)] text-white' : 'bg-[var(--graphite)] text-white'}`}
                key={item.title}
              >
                <Image
                  src={item.image}
                  alt={item.title}
                  width={443}
                  height={443}
                  className={`aspect-[1.18] w-full object-cover ${item.tone === 'accent' ? 'opacity-[0.88]' : 'grayscale'}`}
                />
                <div className="p-5">
                  <h3 className={`${displayFont.className} display-face text-[36px] uppercase leading-none`}>{item.title}</h3>
                  <p className="mt-3 max-w-[17rem] text-sm leading-6 text-white/80">{item.description}</p>
                  <div className="mt-5 flex justify-end">
                    <ArrowUpRight className="transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5" size={22} />
                  </div>
                </div>
              </article>
            ))}
          </div>

          <div className="hidden items-center justify-center xl:flex">
            <EducationCircularMark />
          </div>
        </div>
      </section>

      <section className="editorial-grid border-b border-black/20 py-10 md:py-14" id="community">
        <div className="container grid gap-8 xl:grid-cols-[0.76fr_1.24fr]">
          <div className="flex flex-col justify-between gap-6">
            <div>
              <h2 className={`${displayFont.className} display-tight text-[56px] md:text-[72px]`}>Сообщество</h2>
              <p className="mt-4 max-w-md text-sm leading-7 text-[var(--muted)]">
                Тысячи профессионалов, баров и проектов в едином пространстве. Мы верим в силу
                объединений и поддерживаем культуру открытого диалога.
              </p>
            </div>
            <a
              className="inline-flex w-fit items-center gap-3 border-b border-[var(--text)] pb-2 text-sm font-semibold uppercase tracking-[0.06em]"
              href="/contacts"
            >
              Присоединиться к сообществу
              <ArrowUpRight size={18} />
            </a>
          </div>

          <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-4">
            {stats.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.label}>
                  <Icon className="text-[var(--muted)]" size={28} strokeWidth={1.6} />
                  <p className={`${displayFont.className} display-face mt-6 text-[72px] leading-none md:text-[88px]`}>{item.value}</p>
                  <p className="mt-3 text-sm font-semibold uppercase tracking-[0.06em]">{item.label}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="border-b border-black/20 bg-[var(--graphite)] py-10 text-white md:py-14" id="opportunities">
        <div className="container grid gap-8 xl:grid-cols-[0.72fr_1fr_0.5fr]">
          <div className="flex flex-col justify-between gap-8">
            <div>
              <h2 className={`${displayFont.className} display-tight text-[56px] md:text-[72px]`}>Возможности для индустрии</h2>
              <p className="mt-4 max-w-sm text-sm leading-7 text-white/72">
                Мы соединяем таланты и проекты, помогаем находить партнеров, команду, экспертов и
                ресурсы для развития.
              </p>
            </div>
            <a
              className="inline-flex w-fit items-center gap-3 border-b border-white/70 pb-2 text-sm font-semibold uppercase tracking-[0.06em]"
              href="/contacts"
            >
              Разместить возможность
              <ArrowUpRight size={18} />
            </a>
          </div>

          <div className="grid gap-0 border border-white/16 md:grid-cols-2">
            {opportunities.map((item) => (
              <div className="border-b border-r border-white/16 p-6 last:border-b-0 md:[&:nth-last-child(-n+2)]:border-b-0" key={item.index}>
                <p className={`${displayFont.className} display-face text-xl text-[var(--accent)]`}>{item.index}</p>
                <h3 className="mt-4 text-xl font-semibold uppercase leading-7">{item.title}</h3>
              </div>
            ))}
          </div>

          <div className="texture-panel hidden min-h-[320px] overflow-hidden bg-[var(--surface)] xl:block">
            <div className="absolute inset-y-0 left-0 w-1/3 bg-[var(--accent)] opacity-[0.92]" />
            <div className="absolute inset-0 bg-[url('/images/grain.svg')] opacity-30" />
          </div>
        </div>
      </section>

      <section className="editorial-grid border-b border-black/20 py-10 md:py-14">
        <div className="container grid gap-8 xl:grid-cols-[0.72fr_1.28fr]">
          <div className="flex flex-col justify-between gap-8">
            <div>
              <h2 className={`${displayFont.className} display-tight text-[56px] md:text-[72px]`}>Знания и контент</h2>
            </div>
            <a
              className="inline-flex w-fit items-center gap-3 border-b border-[var(--text)] pb-2 text-sm font-semibold uppercase tracking-[0.06em]"
              href="/articles"
            >
              Смотреть все материалы
              <ArrowUpRight size={18} />
            </a>
          </div>

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {contentCards.map((item) => (
              <article className="border border-black/20 bg-[var(--surface)]" key={item.title}>
                <Image
                  src={item.image}
                  alt={item.title}
                  width={443}
                  height={443}
                  className="aspect-[1.55] w-full object-cover grayscale"
                />
                <div className="p-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--muted)]">{item.type}</p>
                  <h3 className="mt-2 text-base font-semibold leading-6">{item.title}</h3>
                  <div className="mt-4 flex justify-end">
                    <ArrowUpRight size={18} />
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="editorial-grid border-b border-black/20 py-8">
        <div className="container grid gap-6 xl:grid-cols-[0.72fr_1.28fr] xl:items-center">
          <h2 className={`${displayFont.className} display-tight text-[50px] md:text-[64px]`}>Партнеры и коллабораторы</h2>
          <div className="flex flex-wrap items-center justify-start gap-x-10 gap-y-5 border-t border-black/20 pt-6 text-[22px] font-semibold uppercase tracking-[0.04em] md:justify-between xl:border-t-0 xl:pt-0">
            {partners.map((partner) => (
              <p className="whitespace-nowrap" key={partner}>{partner}</p>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
