import Image from 'next/image';
import { ArrowUpRight, Globe, MapPin, MessageCircle, Sparkles } from 'lucide-react';
import { displayFont } from '@/lib/fonts';

const manifesto = [
  'Образование',
  'Обмен опытом',
  'Живое общение',
  'Рост бизнеса',
  'Творческий подход',
  'Профильные контакты'
];

const audienceRoutes = [
  {
    title: 'Бармены и менеджеры',
    description: 'Подбирают обучение, события и материалы для роста в профессии.',
    action: 'Смотреть программы',
    href: '/education'
  },
  {
    title: 'Владельцы и управляющие',
    description: 'Размещают вакансии, ищут поставщиков и отправляют партнерские запросы.',
    action: 'Разместить запрос',
    href: '/contacts'
  },
  {
    title: 'Поставщики и бренды',
    description: 'Показывают компанию, предложения и рабочие контакты для заведений.',
    action: 'Перейти в каталог',
    href: '/suppliers'
  },
  {
    title: 'Партнеры проекта',
    description: 'Находят форматы участия в событиях, обучении и публичных разделах сайта.',
    action: 'Открыть партнерства',
    href: '/partners'
  }
];

const sponsorHighlights = [
  {
    value: 'North Bar Supply',
    title: 'Оборудование и расходники',
    text: 'Поставка барного инвентаря для учебных программ и событий.'
  },
  {
    value: 'BarLab Кавказ',
    title: 'Практическая площадка',
    text: 'Площадка для мастер-классов, дегустаций и встреч с экспертами.'
  },
  {
    value: 'Craft Mix',
    title: 'Ингредиенты и сиропы',
    text: 'Поддержка практических занятий продуктами для отработки рецептур.'
  }
];

const programs = [
  {
    title: 'Интенсивы и мастер-классы',
    description: 'Разбор одной темы с практикой и вопросами к эксперту.',
    image: '/images/generated/program-intensive.jpg',
    tone: 'dark'
  },
  {
    title: 'Онлайн-курсы и лекции',
    description: 'Лекции и материалы, которые можно изучать без привязки к месту.',
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
    label: 'фокус на регионе',
    detail: 'локальные школы, бары и поставщики',
    icon: MapPin
  },
  {
    value: '10',
    label: 'разделов сайта',
    detail: 'единая навигация по публичным сценариям',
    icon: Globe
  },
  {
    value: '04',
    label: 'рабочих направления',
    detail: 'образование, события, вакансии, партнерства',
    icon: Sparkles
  },
  {
    value: '01',
    label: 'прямая связь',
    detail: 'все входящие запросы уходят в команду',
    icon: MessageCircle
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
    title: 'Что сейчас меняется в индустрии',
    image: '/images/generated/content-podcast.jpg'
  },
  {
    type: 'Гид',
    title: 'Как открыть бар и не закрыться в первый год',
    image: '/images/generated/content-guide.jpg'
  }
];

const platformSections = [
  { label: 'Образование', href: '/education', description: 'интенсивы, лекции, практические программы' },
  { label: 'События', href: '/events', description: 'встречи, дегустации, профессиональные форматы' },
  { label: 'Знания', href: '/articles', description: 'материалы, интервью, прикладные разборы' },
  { label: 'Вакансии', href: '/vacancies', description: 'открытые роли и заявки от бизнеса' },
  { label: 'Поставщики', href: '/suppliers', description: 'каталог компаний и рабочих контактов' },
  { label: 'Партнеры', href: '/partners', description: 'коллаборации, школы, площадки и эксперты' },
  { label: 'Генеральные спонсоры', href: '/general-sponsors', description: 'бренды, которые поддерживают развитие проекта' }
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
              <span className="block">Барная</span>
              <span className="block">индустрия</span>
              <span className="block">СКФО:</span>
              <span className="block text-[var(--accent)]">люди и работа</span>
            </h1>
          </div>

          <div className="mt-8 xl:mt-0 xl:w-[54%]">
            <div className="flex min-h-[420px] min-w-0 flex-col justify-between border-l border-black/20 pl-7 pr-6">
              <div>
                <p className={`${displayFont.className} display-face text-[44px] uppercase leading-none`}>BARSYNERGY</p>
                <p className="mt-5 max-w-[18rem] text-[19px] leading-8 sm:max-w-[34rem]">
                  Обучение, события и рабочие контакты для барной индустрии СКФО.
                </p>
                <p className="mt-7 max-w-[18rem] text-[18px] leading-8 text-[var(--muted)] sm:max-w-[34rem]">
                  Здесь можно найти программы, события, вакансии, поставщиков,
                  партнеров и прямой контакт с командой.
                </p>
              </div>

              <div className="flex items-end justify-between gap-4">
                <a
                  className="editorial-link inline-flex min-h-11 items-center gap-3 border-b border-[var(--text)] text-sm font-semibold uppercase tracking-[0.06em]"
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

      <section className="relative overflow-hidden border-b border-black/20 py-12 md:py-16">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(20,20,18,0.06),transparent_34%),radial-gradient(circle_at_82%_16%,rgba(153,44,38,0.11),transparent_24%),linear-gradient(180deg,rgba(255,255,255,0.36),rgba(250,244,232,0.28))]"
        />
        <div className="container relative grid gap-8 xl:grid-cols-[0.62fr_1.38fr]">
          <div className="flex flex-col justify-between gap-7 border-b border-black/18 pb-7 xl:border-b-0 xl:border-r xl:pb-0 xl:pr-8">
            <div>
              <h2 className={`${displayFont.className} display-tight max-w-[34rem] text-[52px] md:text-[64px] 2xl:text-[72px]`}>
                Что такое BARSYNERGY
              </h2>
              <p className="mt-5 max-w-md text-base leading-7 text-[var(--muted)]">
                Публичная точка входа для людей, компаний и партнеров барной индустрии СКФО.
              </p>
            </div>
            <a
              className="editorial-link inline-flex min-h-11 w-fit items-center gap-3 border-b border-[var(--text)] text-sm font-semibold uppercase tracking-[0.06em]"
              href="/contacts"
            >
              Написать команде
              <ArrowUpRight size={18} />
            </a>
          </div>

          <div className="grid gap-0 overflow-hidden border border-black/18 bg-[rgba(250,244,232,0.54)] md:grid-cols-2">
            <div className="relative min-h-[280px] overflow-hidden border-b border-black/18 bg-[var(--graphite)] p-5 text-white md:border-b-0 md:border-r">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-white/54">сценарии сайта</p>
              <p className={`${displayFont.className} display-face mt-10 max-w-[17rem] text-[38px] uppercase leading-none sm:text-[46px] md:text-[54px]`}>
                учиться, искать, размещать, знакомиться
              </p>
              <div aria-hidden="true" className="absolute -bottom-12 -right-10 h-44 w-44 rounded-full border border-white/18" />
              <div aria-hidden="true" className="absolute bottom-8 right-8 hidden h-16 w-16 bg-[var(--accent)] sm:block" />
            </div>
            <div className="grid gap-0">
              {audienceRoutes.map((item, index) => (
                <a
                  className="group grid min-h-[140px] grid-cols-[3rem_minmax(0,1fr)_auto] items-start gap-4 border-b border-black/14 p-5 transition last:border-b-0 hover:bg-white/42 focus-visible:bg-white/42"
                  href={item.href}
                  key={item.title}
                >
                  <span className={`${displayFont.className} display-face text-[32px] leading-none text-[var(--accent)]/80`}>
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <span className="min-w-0">
                    <span className="block text-lg font-semibold uppercase leading-6 tracking-[0.02em] transition group-hover:text-[var(--accent)]">
                      {item.title}
                    </span>
                    <span className="mt-2 block text-sm leading-6 text-[var(--muted)]">{item.description}</span>
                    <span className="mt-4 block text-xs font-semibold uppercase tracking-[0.08em] text-[var(--accent)]">
                      {item.action}
                    </span>
                  </span>
                  <ArrowUpRight className="mt-1 shrink-0 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5" size={19} />
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-black/20 bg-[var(--graphite)] py-10 text-white md:py-14">
        <div className="container grid gap-8 xl:grid-cols-[0.66fr_1.34fr]">
          <div className="flex flex-col justify-between gap-8">
            <div>
              <h2 className={`${displayFont.className} display-tight text-[52px] md:text-[68px]`}>
                Генеральные спонсоры
              </h2>
              <p className="mt-5 max-w-md text-sm leading-7 text-white/72">
                Компании, которые помогают запускать программы, события и полезные материалы для индустрии.
              </p>
            </div>
            <a
              className="editorial-link inline-flex min-h-11 w-fit items-center gap-3 border-b border-white/70 text-sm font-semibold uppercase tracking-[0.06em]"
              href="/general-sponsors"
            >
              Открыть раздел
              <ArrowUpRight size={18} />
            </a>
          </div>

          <div className="grid gap-0 border border-white/16 md:grid-cols-3">
            {sponsorHighlights.map((item) => (
              <article className="border-b border-white/16 p-5 md:border-b-0 md:border-r md:last:border-r-0" key={item.title}>
                <p className={`${displayFont.className} display-face text-[36px] leading-none text-[var(--accent)]`}>
                  {item.value}
                </p>
                <h3 className="mt-5 text-lg font-semibold uppercase leading-7">{item.title}</h3>
                <p className="mt-3 text-sm leading-6 text-white/70">{item.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="editorial-grid border-b border-black/20 py-10 md:py-14">
        <div className="container grid gap-8 xl:grid-cols-[0.58fr_1.42fr]">
          <div className="flex flex-col justify-between gap-8">
            <div>
              <h2 className={`${displayFont.className} display-tight max-w-[34rem] text-[52px] md:text-[64px] 2xl:text-[72px]`}>
                Образование и события
              </h2>
            </div>
            <a
              className="editorial-link inline-flex min-h-11 w-fit items-center gap-3 border-b border-[var(--text)] text-sm font-semibold uppercase tracking-[0.06em]"
              href="/education"
            >
              Смотреть все программы
              <ArrowUpRight size={18} />
            </a>
          </div>

          <div className="grid-flow-dense grid items-stretch gap-4 md:grid-cols-3 xl:gap-5">
            {programs.map((item) => (
              <article
                className={`group flex h-full min-w-0 flex-col overflow-hidden ${item.tone === 'accent' ? 'bg-[var(--accent)] text-white' : 'bg-[var(--graphite)] text-white'}`}
                key={item.title}
              >
                <div className="overflow-hidden">
                  <Image
                    src={item.image}
                    alt={item.title}
                    width={443}
                    height={443}
                    loading="lazy"
                    quality={72}
                    sizes="(min-width: 768px) 28vw, calc(100vw - 32px)"
                    className={`aspect-[1.48] w-full object-cover transition duration-700 ease-out group-hover:scale-105 ${item.tone === 'accent' ? 'opacity-[0.88]' : 'grayscale'}`}
                  />
                </div>
                <div className="flex min-h-[150px] flex-1 flex-col p-5 md:min-h-[170px] xl:min-h-[185px]">
                  <h3 className={`${displayFont.className} display-face text-[30px] uppercase leading-none md:text-[32px] xl:text-[34px]`}>
                    {item.title}
                  </h3>
                  <p className="mt-3 max-w-[17rem] text-sm leading-6 text-white/80">{item.description}</p>
                  <div className="mt-auto flex justify-end pt-5">
                    <ArrowUpRight className="transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5" size={22} />
                  </div>
                </div>
              </article>
            ))}
          </div>

          <div className="hidden" aria-hidden="true">
            <EducationCircularMark />
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden border-b border-black/20 bg-[var(--graphite)] py-12 text-white md:py-16" id="community">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(153,44,38,0.22),transparent_22%),radial-gradient(circle_at_78%_62%,rgba(255,255,255,0.08),transparent_25%),linear-gradient(135deg,rgba(255,255,255,0.05),transparent_42%)]"
        />
        <div className="container relative grid gap-10 xl:grid-cols-[0.58fr_1.42fr]">
          <div className="flex flex-col justify-between gap-6">
            <div>
              <h2 className={`${displayFont.className} display-tight text-[56px] md:text-[72px]`}>Сообщество</h2>
              <p className="mt-4 max-w-md text-sm leading-7 text-white/70">
                Бармены, управляющие, школы, бренды и сервисы используют сайт для обучения,
                событий, вакансий и деловых контактов.
              </p>
            </div>
            <a
              className="editorial-link inline-flex min-h-11 w-fit items-center gap-3 border-b border-white/70 text-sm font-semibold uppercase tracking-[0.06em]"
              href="/contacts"
            >
              Написать команде
              <ArrowUpRight size={18} />
            </a>
          </div>

          <div className="grid-flow-dense grid gap-0 border border-white/16 sm:grid-cols-2 xl:grid-cols-4">
            {stats.map((item, index) => {
              const Icon = item.icon;

              return (
                <article
                  className="group relative min-h-[230px] overflow-hidden border-b border-white/16 p-5 last:border-b-0 sm:border-r sm:[&:nth-child(2n)]:border-r-0 xl:border-b-0 xl:[&:nth-child(2n)]:border-r xl:last:border-r-0"
                  key={item.label}
                >
                  <div className="absolute inset-0 opacity-0 transition duration-500 group-hover:opacity-100">
                    <div className="absolute inset-x-0 top-0 h-px bg-white/50" />
                    <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-[var(--accent)]/35 blur-2xl" />
                  </div>
                  <div className="relative flex h-full flex-col">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex h-14 w-14 items-center justify-center border border-white/18 bg-white/[0.04] text-white/72">
                        <Icon size={23} strokeWidth={1.7} />
                      </div>
                      <span className="text-xs font-semibold text-white/38">{String(index + 1).padStart(2, '0')}</span>
                    </div>
                    <p className={`${displayFont.className} display-face mt-8 text-[62px] leading-none md:text-[76px]`}>
                      {item.value}
                    </p>
                    <p className="mt-3 text-sm font-semibold uppercase tracking-[0.06em]">{item.label}</p>
                    <p className="mt-auto pt-7 text-sm leading-6 text-white/62">{item.detail}</p>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="border-b border-black/20 bg-[var(--graphite)] py-10 text-white md:py-14" id="opportunities">
        <div className="container grid gap-8 xl:grid-cols-[0.72fr_1fr_0.5fr]">
          <div className="flex flex-col justify-between gap-8">
            <div>
              <h2 className={`${displayFont.className} display-tight text-[56px] md:text-[72px]`}>Запросы для индустрии</h2>
              <p className="mt-4 max-w-sm text-sm leading-7 text-white/72">
                На сайте можно разместить вакансию, найти партнера, подобрать поставщика или
                отправить запрос на обучение.
              </p>
            </div>
            <a
              className="editorial-link inline-flex min-h-11 w-fit items-center gap-3 border-b border-white/70 text-sm font-semibold uppercase tracking-[0.06em]"
              href="/contacts"
            >
              Разместить запрос
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
              <h2 className={`${displayFont.className} display-tight text-[56px] md:text-[72px]`}>Материалы и знания</h2>
            </div>
            <a
              className="editorial-link inline-flex min-h-11 w-fit items-center gap-3 border-b border-[var(--text)] text-sm font-semibold uppercase tracking-[0.06em]"
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

      <section className="relative overflow-hidden border-b border-black/20 py-12 md:py-16">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(20,20,18,0.05),transparent_42%),radial-gradient(circle_at_86%_22%,rgba(153,44,38,0.1),transparent_22%)]"
        />
        <div className="container relative grid gap-8 xl:grid-cols-[0.58fr_1.42fr]">
          <div className="flex flex-col justify-between gap-6">
            <h2 className={`${displayFont.className} display-tight max-w-md self-start text-[50px] md:text-[64px]`}>
              Разделы сайта
            </h2>
            <p className="max-w-sm text-sm leading-7 text-[var(--muted)]">
              Быстрые входы в рабочие разделы: обучение, события, заявки, партнерства и контакты.
            </p>
          </div>
          <div className="grid-flow-dense grid overflow-hidden border-y border-black/18 md:grid-cols-2">
            {platformSections.map((section, index) => (
              <a
                className="group grid min-h-[132px] grid-cols-[3.75rem_minmax(0,1fr)_auto] items-center gap-4 border-b border-black/14 py-5 pr-4 transition hover:bg-white/38 focus-visible:bg-white/38 md:border-r md:px-5 md:[&:nth-child(2n)]:border-r-0 md:[&:nth-last-child(-n+2)]:border-b-0"
                href={section.href}
                key={section.href}
              >
                <span className={`${displayFont.className} display-face text-[34px] leading-none text-[var(--accent)]/80`}>
                  {String(index + 1).padStart(2, '0')}
                </span>
                <span className="min-w-0">
                  <span className="block text-xl font-semibold uppercase leading-6 tracking-[0.03em] transition group-hover:text-[var(--accent)]">
                    {section.label}
                  </span>
                  <span className="mt-2 block text-sm font-normal leading-6 text-[var(--muted)]">{section.description}</span>
                </span>
                <ArrowUpRight className="shrink-0 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5" size={20} />
              </a>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
