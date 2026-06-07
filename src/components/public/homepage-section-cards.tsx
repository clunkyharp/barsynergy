import Link from 'next/link';
import type { CSSProperties } from 'react';
import {
  ArrowUpRight,
  BookOpen,
  BriefcaseBusiness,
  CalendarDays,
  Coffee,
  PackageCheck,
  Calculator
} from 'lucide-react';
import { PublicDisplayTitle, PublicEyebrow } from '@/components/public/public-primitives';
import { displayFont } from '@/lib/fonts';

const homeSectionCards = [
  {
    title: 'Обучение',
    description: 'Курсы для бариста и обучение команды: от базовой экстракции до авторских молочных программ.',
    href: '/education',
    status: 'Открыто',
    icon: Coffee
  },
  {
    title: 'Афиша',
    description: 'Каппинги, открытые тренинги, отраслевые встречи и чемпионаты бариста по всему СКФО.',
    href: '/events',
    status: 'Сезон',
    icon: CalendarDays
  },
  {
    title: 'Вакансии',
    description: 'Specialty-кофейни и кофейные бары ищут бариста, управляющих и технологов.',
    href: '/vacancies',
    status: 'Найм',
    icon: BriefcaseBusiness
  },
  {
    title: 'Материалы',
    description: 'Экстракция, обжарка, себестоимость напитка, работа с зерном: читать и применять сразу.',
    href: '/articles',
    status: 'Редакция',
    icon: BookOpen
  },
  {
    title: 'Калькулятор',
    description: 'Считает себестоимость эспрессо, альтернативы или коктейля и показывает рекомендованную цену.',
    href: '/tools/cost-calculator',
    status: 'Инструмент',
    icon: Calculator
  },
  {
    title: 'Поставщики',
    description: 'Обжарщики, дистрибьюторы зерна и оборудования, которые работают с кофейными барами СКФО.',
    href: '/suppliers',
    status: 'Каталог',
    icon: PackageCheck
  }
] as const;

export function HomeSectionCards() {
  return (
    <section className="background-zone background-zone-ivory scroll-mt-28 border-b border-[var(--line)] py-10 md:py-14" id="home-sections" style={{ '--zone-surface': 'var(--background-band)' } as CSSProperties}>
      <div className="container">
        <div className="grid gap-8 xl:grid-cols-[minmax(0,0.48fr)_minmax(0,1.52fr)]">
          <div className="xl:pr-4">
            <PublicEyebrow>Платформа</PublicEyebrow>
            <PublicDisplayTitle className="mt-4 md:text-[44px]">Разделы платформы</PublicDisplayTitle>
          </div>
          <div className="grid gap-5 md:grid-cols-2 md:gap-4 xl:grid-cols-3">
            {homeSectionCards.map((card) => {
              const Icon = card.icon;

              return (
                <Link className="home-section-card group relative min-h-[140px] rounded-[var(--radius-lg)] border border-[var(--border-strong)] bg-[var(--surface-card)] p-5 text-[var(--text)] shadow-[var(--shadow-card)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)]" href={card.href} key={card.title}>
                  <span className="flex items-start justify-between gap-4">
                    <span className="inline-flex h-10 w-10 items-center justify-center rounded-[var(--radius-sm)] bg-[var(--accent)] text-white">
                      <Icon size={18} strokeWidth={1.5} />
                    </span>
                    <span className="rounded-[var(--radius-sm)] border border-[var(--border-default)] px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--muted)]">
                      {card.status}
                    </span>
                  </span>
                  <span className={`${displayFont.className} mt-5 block text-[1.5rem] font-semibold leading-none text-[var(--text)]`}>
                    {card.title}
                  </span>
                  <span className="mt-3 block text-sm leading-6 text-[var(--muted)]">{card.description}</span>
                  <ArrowUpRight aria-hidden="true" className="absolute bottom-5 right-5 text-[var(--accent)]" size={18} strokeWidth={1.5} />
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
