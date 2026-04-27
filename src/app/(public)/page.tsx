import Image from 'next/image';
import { ArrowUpRight } from 'lucide-react';
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
    title: 'Сообщество профессионалов региона',
    description: 'Бармены, менеджеры, владельцы и эксперты получают общий профессиональный контур.',
    image: '/images/home/community-region.webp'
  },
  {
    title: 'Образовательные программы и живые интенсивы',
    description: 'Практические форматы для тех, кто усиливает навыки и систему работы.',
    image: '/images/home/professional-education.webp'
  },
  {
    title: 'Обмен идеями, опытом и вдохновением',
    description: 'Материалы, события и профессиональный диалог без лишнего шума.',
    image: '/images/home/ideas-exchange.webp'
  },
  {
    title: 'Поддержка роста проектов и карьеры',
    description: 'Вакансии, партнерства, поставщики и новые точки роста для индустрии.',
    image: '/images/home/project-growth.webp'
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
  {
    value: 'СКФО',
    label: 'региональный фокус',
    image: '/images/community/community-region.webp',
    imageAlt: 'Региональный фокус BARSYNERGY'
  },
  {
    value: '09',
    label: 'публичных разделов',
    image: '/images/community/community-platform.webp',
    imageAlt: 'Публичные разделы платформы'
  },
  {
    value: '04',
    label: 'основных направления',
    image: '/images/community/community-directions.webp',
    imageAlt: 'Основные направления сообщества'
  },
  {
    value: '01',
    label: 'контактный канал',
    image: '/images/community/community-message.webp',
    imageAlt: 'Контактный канал команды'
  }
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
    title: 'Разговор с командой бара о сервисе',
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

const platformSections = [
  { label: 'Образование', href: '/education' },
  { label: 'События', href: '/events' },
  { label: 'Знания', href: '/articles' },
  { label: 'Вакансии', href: '/vacancies' },
  { label: 'Поставщики', href: '/suppliers' },
  { label: 'Партнеры', href: '/partners' }
];

function EducationCircularMark() {
  return (
    <svg
      aria-label="Учись, обменивайся, вдохновляйся"
      className="h-64 w-64 overflow-visible text-[var(--muted)]"
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
        fontSize="15"
        fontWeight="700"
        letterSpacing="0.12em"
        lengthAdjust="spacing"
        textLength="666"
        transform="rotate(-18 120 120)"
      >
        <textPath href="#educationCircularTextPath" startOffset="0%" textAnchor="start">
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
            </h1>
          </div>

          <div className="mt-8 xl:mt-0 xl:w-[54%]">
            <div className="flex min-h-[420px] min-w-0 flex-col justify-between border-l border-black/20 pl-7 pr-6">
              <div>
                <p className={`${displayFont.className} display-face text-[44px] uppercase leading-none`}>BARSYNERGY</p>
                <p className="mt-5 max-w-[18rem] text-[19px] leading-8 sm:max-w-[34rem]">
                  Образовательная и профессиональная платформа для барной индустрии СКФО.
                </p>
                <p className="mt-7 max-w-[18rem] text-[18px] leading-8 text-[var(--muted)] sm:max-w-[34rem]">
                  Мы объединяем людей, идеи и опыт, чтобы поддерживать образование, события,
                  вакансии, партнерства и отраслевые контакты.
                </p>
              </div>

              <div className="flex items-end justify-between gap-4">
                <a
                  className="inline-flex min-h-11 items-center gap-3 border-b border-[var(--text)] text-sm font-semibold uppercase tracking-[0.06em]"
                  href="/contacts"
                >
                  Связаться с командой
                  <ArrowUpRight size={18} />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="overflow-x-hidden border-b border-black/20 bg-[var(--graphite)] text-white">
        <div className="marquee-viewport py-5">
          <div className="marquee-track text-sm font-semibold uppercase tracking-[0.06em]">
            {[0, 1, 2].map((group) => (
              <div aria-hidden={group === 1} className="marquee-group" key={group}>
                {manifesto.map((item) => (
                  <div className="flex items-center gap-8" key={`${group}-${item}`}>
                    <span>{item}</span>
                    <span className="text-white/60">•</span>
                  </div>
                ))}
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
              BARSYNERGY — это пространство для тех, кто работает в барной индустрии и хочет развивать ее через знания, контакты и практические возможности.
            </p>
            <div className="mt-10 grid gap-5 md:grid-cols-2">
	              {values.map((item) => (
	                <article className="overflow-hidden border border-black/20 bg-[var(--surface)]" key={item.title}>
	                  <Image
	                    src={item.image}
	                    alt={item.title}
	                    width={640}
	                    height={640}
	                    loading="lazy"
	                    quality={72}
	                    sizes="(min-width: 1280px) 18vw, (min-width: 768px) 42vw, calc(100vw - 32px)"
	                    className="aspect-square w-full object-cover"
	                  />
                  <div className="border-t border-black/15 p-4">
                    <h3 className="text-base font-semibold">{item.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{item.description}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>

          <div className="texture-panel min-h-[220px] overflow-hidden border border-black/20 bg-[var(--graphite)]">
            <div className="grid h-full grid-cols-2">
              <div className="border-r border-white/10 bg-[linear-gradient(135deg,rgba(255,255,255,0.1),rgba(255,255,255,0))] opacity-70" />
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
              className="inline-flex min-h-11 w-fit items-center gap-3 border-b border-[var(--text)] text-sm font-semibold uppercase tracking-[0.06em]"
              href="/education"
            >
              Смотреть все программы
              <ArrowUpRight size={18} />
            </a>
          </div>

          <div className="grid items-stretch gap-5 md:grid-cols-3">
            {programs.map((item) => (
              <article
                className={`group flex h-full flex-col border border-black/20 ${item.tone === 'accent' ? 'bg-[var(--accent)] text-white' : 'bg-[var(--graphite)] text-white'}`}
                key={item.title}
	              >
	                <Image
	                  src={item.image}
	                  alt={item.title}
	                  width={443}
	                  height={443}
	                  loading="lazy"
	                  quality={72}
	                  sizes="(min-width: 768px) 28vw, calc(100vw - 32px)"
	                  className={`aspect-[1.18] w-full object-cover ${item.tone === 'accent' ? 'opacity-[0.88]' : 'grayscale'}`}
	                />
                <div className="flex min-h-[210px] flex-1 flex-col p-5 md:min-h-[240px] xl:min-h-[260px]">
                  <h3 className={`${displayFont.className} display-face text-[36px] uppercase leading-none`}>{item.title}</h3>
                  <p className="mt-3 max-w-[17rem] text-sm leading-6 text-white/80">{item.description}</p>
                  <div className="mt-auto flex justify-end pt-5">
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
        <div className="container grid gap-10 xl:grid-cols-[0.58fr_1.42fr]">
          <div className="flex flex-col justify-between gap-6">
            <div>
              <h2 className={`${displayFont.className} display-tight text-[56px] md:text-[72px]`}>Сообщество</h2>
              <p className="mt-4 max-w-md text-sm leading-7 text-[var(--muted)]">
                Профессионалы, бары, школы и партнеры получают единую точку входа в образование,
                события, вакансии и деловые контакты.
              </p>
            </div>
            <a
              className="inline-flex min-h-11 w-fit items-center gap-3 border-b border-[var(--text)] text-sm font-semibold uppercase tracking-[0.06em]"
              href="/contacts"
            >
              Написать команде
              <ArrowUpRight size={18} />
            </a>
          </div>

          <div className="grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-[1.2fr_repeat(3,0.86fr)]">
            {stats.map((item) => (
              <div className="min-w-0" key={item.label}>
	                <div className="w-24 max-w-full overflow-hidden border border-black/16 bg-[var(--surface)] md:w-28 xl:w-32">
	                  <Image
	                    alt={item.imageAlt}
	                    className="aspect-square w-full object-cover"
	                    height={384}
	                    loading="lazy"
	                    quality={68}
	                    sizes="(min-width: 1280px) 128px, (min-width: 768px) 112px, 96px"
	                    src={item.image}
	                    width={384}
	                  />
                </div>
                <p className={`${displayFont.className} display-face mt-5 text-[56px] leading-none md:text-[68px] 2xl:text-[78px]`}>
                  {item.value}
                </p>
                <p className="mt-3 text-sm font-semibold uppercase tracking-[0.06em]">{item.label}</p>
              </div>
            ))}
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
              className="inline-flex min-h-11 w-fit items-center gap-3 border-b border-white/70 text-sm font-semibold uppercase tracking-[0.06em]"
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
            <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(20,20,18,0.08),transparent_58%)]" />
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
              className="inline-flex min-h-11 w-fit items-center gap-3 border-b border-[var(--text)] text-sm font-semibold uppercase tracking-[0.06em]"
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
	                  loading="lazy"
	                  quality={72}
	                  sizes="(min-width: 1280px) 18vw, (min-width: 768px) 42vw, calc(100vw - 32px)"
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

      <section className="editorial-grid border-b border-black/20">
        <div className="container grid min-h-[240px] gap-8 py-10 xl:grid-cols-[0.72fr_1.28fr]">
          <h2 className={`${displayFont.className} display-tight max-w-md self-start text-[50px] md:text-[64px]`}>
            Направления платформы
          </h2>
          <div className="grid content-end gap-x-8 gap-y-7 border-t border-black/20 pt-8 text-left text-[22px] font-semibold uppercase tracking-[0.04em] md:grid-cols-3 xl:border-t-0 xl:pt-0">
            {platformSections.map((section) => (
              <a
                className="inline-flex min-h-11 items-center whitespace-nowrap transition hover:text-[var(--accent)] focus-visible:text-[var(--accent)]"
                href={section.href}
                key={section.href}
              >
                {section.label}
              </a>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
