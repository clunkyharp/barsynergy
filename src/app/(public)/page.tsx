import { ArrowRight, BookOpen, BriefcaseBusiness, CalendarDays, Handshake, Newspaper, Truck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { SectionHeader } from '@/components/ui/section-header';

const directions = [
  {
    title: 'Образование',
    description: 'Курсы, интенсивы и практические программы для барменов, менеджеров и владельцев.',
    href: '/education',
    icon: BookOpen
  },
  {
    title: 'События',
    description: 'Профессиональные встречи, лекции, дегустации и отраслевые мероприятия в регионе.',
    href: '/events',
    icon: CalendarDays
  },
  {
    title: 'Знания',
    description: 'Статьи, интервью, тренды, методические материалы и практический опыт экспертов.',
    href: '/articles',
    icon: Newspaper
  },
  {
    title: 'Вакансии',
    description: 'Работа, стажировки и размещение вакансий для заведений и специалистов.',
    href: '/vacancies',
    icon: BriefcaseBusiness
  },
  {
    title: 'Поставщики',
    description: 'Каталог поставщиков, мастеров, сервисов и полезных B2B-контактов.',
    href: '/suppliers',
    icon: Truck
  },
  {
    title: 'Партнеры',
    description: 'Форматы сотрудничества для брендов, школ, заведений и индустриальных проектов.',
    href: '/partners',
    icon: Handshake
  }
];

export default function HomePage() {
  return (
    <div>
      <section className="border-b border-[var(--line)] py-16 md:py-24">
        <div className="container grid gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
          <div>
            <p className="mb-5 text-sm font-semibold uppercase tracking-[0.16em] text-[var(--accent)]">
              СКФО · барная индустрия · образование
            </p>
            <h1 className="max-w-4xl text-4xl font-semibold leading-tight tracking-[-0.02em] md:text-6xl">
              Профессиональная экосистема для барной индустрии региона
            </h1>
            <p className="mt-6 max-w-2xl text-lg text-[var(--muted)]">
              BARSYNERGY объединяет образование, комьюнити, события, вакансии, поставщиков и
              партнерские возможности в одной рабочей среде.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button href="/education">
                Смотреть программы
                <ArrowRight size={18} />
              </Button>
              <Button href="/partners" variant="secondary">
                Стать партнером
              </Button>
            </div>
          </div>
          <Card className="p-6">
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
              Формула проекта
            </p>
            <div className="mt-6 space-y-4 text-2xl font-semibold leading-snug">
              <p>Образование</p>
              <p>+ комьюнити</p>
              <p>+ индустриальные возможности</p>
              <p className="text-[var(--accent)]">+ региональная связь</p>
            </div>
          </Card>
        </div>
      </section>

      <section className="py-14 md:py-20">
        <div className="container">
          <SectionHeader
            eyebrow="Направления"
            title="Основа MVP"
            description="В Phase 0 заложена структура будущей платформы. Разделы пока готовы как навигационный каркас для следующих фаз."
          />
          <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {directions.map((item) => {
              const Icon = item.icon;
              return (
                <Card key={item.title} className="group p-6">
                  <Icon className="mb-6 text-[var(--accent)]" size={26} />
                  <h2 className="text-xl font-semibold">{item.title}</h2>
                  <p className="mt-3 text-[var(--muted)]">{item.description}</p>
                  <a
                    className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-[var(--accent)]"
                    href={item.href}
                  >
                    Открыть раздел
                    <ArrowRight className="transition group-hover:translate-x-1" size={16} />
                  </a>
                </Card>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
