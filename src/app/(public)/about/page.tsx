import type { Metadata } from 'next';
import Image from 'next/image';
import {
  BadgeCheck,
  BriefcaseBusiness,
  Calculator,
  CalendarDays,
  ClipboardCheck,
  GraduationCap,
  Handshake,
  MapPin,
  PackageCheck,
  PanelsTopLeft,
} from 'lucide-react';
import { PublicBreadcrumbs } from '@/components/public/public-primitives';
import { Button } from '@/components/ui/button';
import { displayFont } from '@/lib/fonts';

export const metadata: Metadata = {
  title: 'О проекте',
  description: 'BARSYNERGY собирает обучение, события, вакансии, поставщиков, партнёрства и инструменты для барной индустрии Северного Кавказа.'
};

const insidePlatform = [
  'события и профессиональные встречи',
  'программы и интенсивы',
  'вакансии для команд',
  'каталог поставщиков',
  'партнёрские и спонсорские форматы',
  'инструменты для заведений'
] as const;

const timeline = [
  {
    title: 'Идея',
    text: 'Собрать разрозненные индустриальные сценарии в одном месте.'
  },
  {
    title: 'Пилот',
    text: 'Запустить первые разделы: события, поставщики, вакансии, материалы.'
  },
  {
    title: 'Развитие',
    text: 'Добавить консалтинг, партнёрские форматы, спонсорство и инструменты.'
  },
  {
    title: 'Дальше',
    text: 'Сформировать рабочую платформу для баров, кофеен, команд и брендов региона.'
  }
] as const;

const stats = [
  {
    value: '2026',
    label: 'год пилотного запуска платформы'
  },
  {
    value: '6 направлений',
    label: 'образование, события, вакансии, поставщики, партнёрства и инструменты'
  },
  {
    value: '1 региональный фокус',
    label: 'Северный Кавказ и профессиональная барная среда'
  },
  {
    value: '4 аудитории',
    label: 'специалисты, заведения, поставщики и бренды'
  }
] as const;

const directions = [
  {
    title: 'Образование',
    text: 'Собираем интенсивы, мастер-классы, командные форматы и практические программы для специалистов и заведений.',
    icon: GraduationCap
  },
  {
    title: 'События',
    text: 'Публикуем профессиональные встречи, гостевые смены, дегустации, мастер-классы и индустриальные активности.',
    icon: CalendarDays
  },
  {
    title: 'Вакансии',
    text: 'Помогаем заведениям находить людей, а специалистам видеть актуальные возможности в регионе.',
    icon: BriefcaseBusiness
  },
  {
    title: 'Поставщики',
    text: 'Формируем каталог компаний и сервисов, которые работают с барами, кофейнями и ресторанными командами.',
    icon: PackageCheck
  },
  {
    title: 'Партнёрства',
    text: 'Запускаем совместные форматы с брендами, школами, экспертами, площадками и поставщиками.',
    icon: Handshake
  },
  {
    title: 'Инструменты',
    text: 'Делаем простые цифровые решения: калькуляторы, формы заявок, боты и рабочие мини-системы.',
    icon: Calculator
  }
] as const;

const audiences = [
  {
    title: 'Специалистам',
    text: 'Найти обучение, события, материалы, вакансии и профессиональные контакты.',
    wide: true
  },
  {
    title: 'Заведениям',
    text: 'Искать сотрудников, поставщиков, консультации, инструменты и партнёрские возможности.',
    wide: true
  },
  {
    title: 'Поставщикам',
    text: 'Показать компанию, продукты, географию работы и получить контакт с профильной аудиторией.',
    wide: false
  },
  {
    title: 'Брендам',
    text: 'Запускать спонсорские форматы, события, спецпроекты и присутствие в профессиональной среде.',
    wide: false
  },
  {
    title: 'Экспертам',
    text: 'Предлагать консультации, материалы, обучение и участие в индустриальных проектах.',
    wide: false
  }
] as const;

const teamRoles = [
  {
    title: 'Редакция и контент',
    text: 'Собирает описания, материалы, события, карточки поставщиков и профессиональные истории.'
  },
  {
    title: 'Партнёрства',
    text: 'Работает с брендами, поставщиками, площадками, экспертами и спонсорскими форматами.'
  },
  {
    title: 'Продукт и разработка',
    text: 'Развивает сайт, формы заявок, личные кабинеты, калькуляторы и рабочие инструменты.'
  },
  {
    title: 'Эксперты',
    text: 'Подключаются к консультациям, обучению, разбору бизнес-задач и индустриальным проектам.'
  }
] as const;

const expertAreas = [
  {
    title: 'Запуск заведения',
    text: 'Концепция, меню, оборудование, команда, первые процессы и запуск точки.'
  },
  {
    title: 'Барная карта',
    text: 'Структура напитков, себестоимость, подача, авторские позиции и логика меню.'
  },
  {
    title: 'Обучение команды',
    text: 'Программы для бариста, барменов, менеджеров и смен.'
  },
  {
    title: 'Себестоимость',
    text: 'Расчёт цены, маржинальность, потери, фудкост и экономика позиций.'
  },
  {
    title: 'Поставщики',
    text: 'Подбор категорий, условий, географии работы и альтернативных вариантов.'
  },
  {
    title: 'Операционный аудит',
    text: 'Процессы, сервис, заявки, коммуникация и ежедневная работа команды.'
  }
] as const;

const workSteps = [
  {
    title: 'Собираем контекст',
    text: 'Понимаем, кто обращается: специалист, заведение, поставщик, бренд, эксперт или площадка.'
  },
  {
    title: 'Подбираем формат',
    text: 'Предлагаем подходящий сценарий: публикацию, событие, консультацию, партнёрство, каталог или инструмент.'
  },
  {
    title: 'Запускаем первый шаг',
    text: 'Готовим карточку, страницу, форму заявки, публикацию, расчёт или рабочий процесс.'
  },
  {
    title: 'Улучшаем дальше',
    text: 'Смотрим на отклик, уточняем формат и добавляем новые сценарии: материалы, события, контакты и инструменты.'
  }
] as const;

const partnerCategories = [
  'Бары и кофейни',
  'Площадки и образовательные проекты',
  'Поставщики и сервисы',
  'Бренды и производители',
  'Эксперты и наставники',
  'Локальные сообщества и медиа'
] as const;

function SectionTitle({
  eyebrow,
  title,
  text,
  className
}: {
  eyebrow?: string;
  title: string;
  text?: string;
  className?: string;
}) {
  return (
    <div className={className}>
      {eyebrow ? <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--accent)]">{eyebrow}</p> : null}
      <h2 className={`${displayFont.className} mt-3 max-w-4xl text-[clamp(2.5rem,4.8vw,3.5rem)] font-semibold leading-none text-[var(--text)]`}>
        {title}
      </h2>
      {text ? <p className="mt-5 max-w-3xl text-base leading-7 text-[var(--muted)] md:text-lg md:leading-8">{text}</p> : null}
    </div>
  );
}

function DirectionIcon({ icon: Icon }: { icon: typeof GraduationCap }) {
  return (
    <span className="flex h-12 w-12 items-center justify-center rounded-full border border-[var(--border-default)] bg-[var(--surface-wash-strong)] text-[var(--accent)]">
      <Icon size={20} strokeWidth={1.8} />
    </span>
  );
}

export default function AboutPage() {
  return (
    <div className="bg-[var(--background)]">
      <section className="background-zone background-zone-hero border-b border-[var(--line)] py-12 md:py-16">
        <div className="mx-auto grid max-w-[1240px] gap-8 px-5 md:min-h-[560px] md:px-12 xl:grid-cols-[minmax(0,0.58fr)_minmax(0,0.42fr)] xl:items-center">
          <div className="min-w-0">
            <PublicBreadcrumbs current="О проекте" />
            <p className="mt-5 inline-flex rounded-full border border-[var(--border-default)] bg-[var(--surface-wash)] px-4 py-2 text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--accent)]">
              О проекте
            </p>
            <h1 className={`${displayFont.className} mt-7 max-w-5xl text-[clamp(2.65rem,7vw,5.2rem)] font-semibold leading-none text-[var(--text)]`}>
              BARSYNERGY собирает барную индустрию Северного Кавказа в одну рабочую среду
            </h1>
            <p className="mt-6 max-w-3xl text-base leading-7 text-[var(--muted)] md:text-lg md:leading-8">
              Мы объединяем обучение, события, вакансии, поставщиков, партнёрские форматы и цифровые инструменты для баров, кофеен, команд, экспертов и брендов региона.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button className="h-12 rounded-full px-7" href="/contacts?topic=other#contact-form" size="lg">
                Связаться с командой
              </Button>
              <Button className="h-12 rounded-full px-7" href="#directions" size="lg" variant="secondary">
                Посмотреть разделы
              </Button>
            </div>
          </div>

          <aside className="rounded-[28px] border border-[var(--border-default)] bg-[var(--surface-card)] p-5 shadow-[var(--shadow-card)] md:p-8">
            <div className="flex items-center gap-3">
              <DirectionIcon icon={PanelsTopLeft} />
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--muted)]">Что внутри</p>
                <h2 className="mt-1 text-2xl font-semibold leading-7 text-[var(--text)]">Что внутри платформы</h2>
              </div>
            </div>
            <ul className="mt-7 grid gap-3">
              {insidePlatform.map((item) => (
                <li className="flex gap-3 border-t border-[var(--line)] pt-3 text-sm leading-6 text-[var(--text)]" key={item}>
                  <BadgeCheck className="mt-0.5 shrink-0 text-[var(--accent)]" size={18} strokeWidth={1.8} />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </aside>
        </div>
      </section>

      <section className="background-zone background-zone-ivory border-b border-[var(--line)] py-16 md:py-24">
        <div className="mx-auto grid max-w-[1240px] gap-10 px-5 md:px-12 xl:grid-cols-[minmax(0,0.62fr)_minmax(20rem,0.38fr)]">
          <div>
            <SectionTitle title="Почему мы запустили BARSYNERGY" />
            <div className="mt-8 grid gap-5 text-base leading-8 text-[var(--muted)] md:text-lg md:leading-9">
              <p>
                В барной индустрии региона много сильных специалистов, заведений, поставщиков, школ, экспертов и брендов. Но информация о них часто живёт в разных местах: в чатах, личных рекомендациях, публикациях в соцсетях и отдельных заявках.
              </p>
              <p>
                BARSYNERGY появился, чтобы собрать эти сценарии в одну понятную систему. Специалистам проще находить обучение, события и вакансии. Заведениям — поставщиков, людей, консультации и инструменты. Брендам и партнёрам — форматы для участия в профессиональной среде региона.
              </p>
              <p>
                Мы развиваем платформу постепенно: сначала запускаем основные разделы, проверяем реальные сценарии, затем добавляем новые форматы, инструменты и партнёрские возможности.
              </p>
            </div>
          </div>

          <ol className="grid gap-4">
            {timeline.map((item, index) => (
              <li className="rounded-[24px] border border-[var(--border-default)] bg-[var(--surface-wash)] p-5" key={item.title}>
                <div className="flex items-start gap-4">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--accent)] text-sm font-semibold tabular-nums text-[var(--accent-contrast)]">
                    {index + 1}
                  </span>
                  <div>
                    <h3 className="text-lg font-semibold text-[var(--text)]">{item.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{item.text}</p>
                  </div>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="background-zone background-zone-beige border-b border-[var(--line)] py-16 md:py-24">
        <div className="mx-auto max-w-[1240px] px-5 md:px-12">
          <SectionTitle title="BARSYNERGY в цифрах" />
          <dl className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {stats.map((stat) => (
              <div className="rounded-[24px] border border-[var(--border-default)] bg-[var(--surface-card)] p-5 md:p-6" key={stat.value}>
                <dt className={`${displayFont.className} text-[2.6rem] font-semibold leading-none text-[var(--text)] md:text-[3.2rem]`}>{stat.value}</dt>
                <dd className="mt-4 text-sm leading-6 text-[var(--muted)]">{stat.label}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section className="background-zone background-zone-ivory border-b border-[var(--line)] py-16 md:py-24" id="directions">
        <div className="mx-auto max-w-[1240px] px-5 md:px-12">
          <SectionTitle
            title="Что делает BARSYNERGY"
            text="На платформе можно найти обучение, событие, вакансию, поставщика, партнёрский формат или инструмент для расчётов и заявок."
          />
          <div className="mt-9 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {directions.map((item, index) => (
              <article className="rounded-[24px] border border-[var(--border-default)] bg-[var(--surface-card)] p-5 md:p-6" key={item.title}>
                <div className="flex items-center justify-between gap-4">
                  <DirectionIcon icon={item.icon} />
                  <span className="text-sm font-semibold tabular-nums text-[var(--muted)]">{index + 1}</span>
                </div>
                <h3 className="mt-6 text-2xl font-semibold leading-8 text-[var(--text)]">{item.title}</h3>
                <p className="mt-3 text-sm leading-7 text-[var(--muted)]">{item.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="background-zone background-zone-gray border-b border-[var(--line)] py-16 md:py-24">
        <div className="mx-auto max-w-[1240px] px-5 md:px-12">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <SectionTitle className="max-w-3xl" title="Кому полезна платформа" />
            <Button className="h-12 rounded-full px-7" href="#directions" size="lg" variant="secondary">
              Выбрать свой раздел
            </Button>
          </div>
          <div className="mt-9 grid gap-4 md:grid-cols-6">
            {audiences.map((item) => (
              <article
                className={[
                  'rounded-[24px] border border-[var(--border-default)] bg-[var(--surface-card)] p-5 md:p-6',
                  item.wide ? 'md:col-span-3' : 'md:col-span-2'
                ].join(' ')}
                key={item.title}
              >
                <h3 className="text-2xl font-semibold leading-8 text-[var(--text)]">{item.title}</h3>
                <p className="mt-3 text-sm leading-7 text-[var(--muted)]">{item.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="background-zone background-zone-ivory border-b border-[var(--line)] py-16 md:py-24">
        <div className="mx-auto grid max-w-[1240px] gap-9 px-5 md:px-12 xl:grid-cols-[minmax(18rem,0.34fr)_minmax(0,0.66fr)]">
          <SectionTitle
            title="Команда проекта"
            text="Публичные персональные карточки появятся позже. Сейчас команда раскрывается через роли, которые отвечают за запуск и развитие платформы."
          />
          <div className="grid gap-4 md:grid-cols-2">
            {teamRoles.map((role) => (
              <article className="rounded-[24px] border border-[var(--border-default)] bg-[var(--surface-card)] p-5 md:p-6" key={role.title}>
                <h3 className="text-xl font-semibold leading-7 text-[var(--text)]">{role.title}</h3>
                <p className="mt-3 text-sm leading-7 text-[var(--muted)]">{role.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="background-zone background-zone-beige border-b border-[var(--line)] py-16 md:py-24">
        <div className="mx-auto max-w-[1240px] px-5 md:px-12">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <SectionTitle
              className="max-w-4xl"
              title="Эксперты по направлениям"
              text="Мы подключаем специалистов под конкретную задачу: запуск заведения, барная карта, обучение команды, себестоимость, поставщики, операционные процессы и цифровые инструменты."
            />
            <Button className="h-12 rounded-full px-7" href="/contacts?topic=consulting#contact-form" size="lg">
              Описать задачу
            </Button>
          </div>
          <div className="mt-9 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {expertAreas.map((area) => (
              <article className="rounded-[24px] border border-[var(--border-default)] bg-[var(--surface-card)] p-5 md:p-6" key={area.title}>
                <h3 className="text-xl font-semibold leading-7 text-[var(--text)]">{area.title}</h3>
                <p className="mt-3 text-sm leading-7 text-[var(--muted)]">{area.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="background-zone background-zone-ivory border-b border-[var(--line)] py-16 md:py-24">
        <div className="mx-auto max-w-[1240px] px-5 md:px-12">
          <SectionTitle
            title="Как мы работаем"
            text="После заявки мы уточняем задачу, предлагаем первый формат и объясняем, что можно запустить без большого технического задания."
          />
          <ol className="mt-10 grid gap-5 md:grid-cols-4">
            {workSteps.map((step, index) => (
              <li className="relative rounded-[24px] border border-[var(--border-default)] bg-[var(--surface-card)] p-5 md:p-6" key={step.title}>
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[var(--surface-inverse)] text-sm font-semibold tabular-nums text-[var(--background)]">
                  {index + 1}
                </span>
                <h3 className="mt-6 text-xl font-semibold leading-7 text-[var(--text)]">{step.title}</h3>
                <p className="mt-3 text-sm leading-7 text-[var(--muted)]">{step.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="background-zone background-zone-gray border-b border-[var(--line)] py-16 md:py-24">
        <div className="mx-auto grid max-w-[1240px] gap-9 px-5 md:px-12 xl:grid-cols-[minmax(0,0.52fr)_minmax(20rem,0.48fr)] xl:items-start">
          <div>
            <SectionTitle title="С кем мы работаем" />
            <p className="mt-6 max-w-3xl text-base leading-8 text-[var(--muted)] md:text-lg md:leading-9">
              Мы формируем сеть участников постепенно и не добавляем компании для количества. Каждый профиль, событие или партнёрский формат должен быть полезен профессиональной аудитории.
            </p>
            <Button className="mt-8 h-12 rounded-full px-7" href="/contacts?topic=sponsorship#contact-form" size="lg">
              Стать партнёром
            </Button>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {partnerCategories.map((category) => (
              <div className="flex min-h-[88px] items-center gap-3 rounded-[22px] border border-[var(--border-default)] bg-[var(--surface-card)] p-4" key={category}>
                <DirectionIcon icon={Handshake} />
                <p className="text-sm font-semibold leading-6 text-[var(--text)]">{category}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="background-zone background-zone-ivory border-b border-[var(--line)] py-16 md:py-24">
        <div className="mx-auto max-w-[1240px] px-5 md:px-12">
          <div className="overflow-hidden rounded-[32px] border border-[var(--border-default)] bg-[var(--surface-card)]">
            <div className="grid gap-0 xl:grid-cols-[minmax(0,0.52fr)_minmax(0,0.48fr)]">
              <div className="p-6 md:p-10">
                <div className="flex items-center gap-3">
                  <DirectionIcon icon={MapPin} />
                  <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--accent)]">Региональный контекст</p>
                </div>
                <h2 className={`${displayFont.className} mt-6 max-w-3xl text-[clamp(2.5rem,4.8vw,3.5rem)] font-semibold leading-none text-[var(--text)]`}>
                  Наш контекст — Северный Кавказ
                </h2>
                <div className="mt-6 grid gap-5 text-base leading-8 text-[var(--muted)] md:text-lg md:leading-9">
                  <p>
                    Мы фокусируемся на регионе, где барная и кофейная культура развивается через локальные команды, заведения, поставщиков, образовательные инициативы и личные связи.
                  </p>
                  <p>
                    BARSYNERGY помогает сделать эту среду видимой: собрать события, людей, компании, возможности и рабочие инструменты в одной точке.
                  </p>
                </div>
              </div>
              <div className="relative min-h-[320px] border-t border-[var(--line)] xl:border-l xl:border-t-0">
                <Image
                  alt=""
                  className="h-full w-full object-cover"
                  fill
                  priority
                  sizes="(min-width: 1280px) 48vw, 100vw"
                  src="/images/home/community-region.webp"
                />
                <div className="absolute inset-x-5 bottom-5 rounded-[22px] border border-white/20 bg-black/55 p-4 text-white backdrop-blur-sm">
                  <p className="text-sm font-semibold leading-6">События, компании, вакансии, обучение и консультации для барной индустрии региона.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="background-zone background-zone-cta py-16 md:py-24">
        <div className="mx-auto max-w-[1240px] px-5 md:px-12">
          <div className="rounded-[32px] border border-[var(--border-inverse-soft)] bg-[var(--surface-inverse)] p-6 text-white md:p-10 xl:p-12">
            <div className="grid gap-8 xl:grid-cols-[minmax(0,0.62fr)_minmax(20rem,0.38fr)] xl:items-end">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-white/58">Следующий шаг</p>
                <h2 className={`${displayFont.className} mt-4 max-w-4xl text-[clamp(2.7rem,5vw,4.2rem)] font-semibold leading-none text-white`}>
                  Что дальше?
                </h2>
                <div className="mt-6 grid gap-5 text-base leading-8 text-white/72 md:text-lg md:leading-9">
                  <p>
                    Мы развиваем платформу постепенно: добавляем новые карточки поставщиков, события, вакансии, материалы, консультации и инструменты для заведений.
                  </p>
                  <p>
                    Сейчас нам особенно важны первые участники: команды, эксперты, поставщики, бренды и площадки, которые хотят развивать профессиональную среду региона вместе с нами.
                  </p>
                </div>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap xl:justify-end">
                <Button className="h-12 rounded-full px-7" href="/contacts?topic=other#contact-form" size="lg">
                  Связаться с командой
                </Button>
                <Button className="h-12 rounded-full px-7" href="/contacts?topic=sponsorship#contact-form" size="lg" variant="secondary">
                  Стать партнёром
                </Button>
                <Button className="h-12 rounded-full px-7" href="/suppliers#supplier-request" size="lg" variant="secondary">
                  Добавить компанию
                </Button>
              </div>
            </div>
            <div className="mt-8 flex items-center gap-3 border-t border-white/15 pt-5 text-sm leading-6 text-white/68">
              <ClipboardCheck className="shrink-0" size={18} strokeWidth={1.8} />
              <p>Если вы хотите добавить событие, компанию, вакансию, экспертный формат или партнёрскую идею, напишите команде.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
