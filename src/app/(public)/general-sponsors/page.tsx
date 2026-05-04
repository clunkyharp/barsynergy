import type { Metadata } from 'next';
import { ArrowUpRight, BookOpen, GraduationCap, Handshake, Megaphone, Star, Users } from 'lucide-react';
import { GeneralSponsorCard } from '@/components/public/general-sponsor-card';
import { PublicBodyText, PublicDisplayTitle, PublicEyebrow } from '@/components/public/public-primitives';
import { FeatureItem, IconBadge, SectionCtaPanel } from '@/components/public/public-ui-adaptation';
import { Button } from '@/components/ui/button';
import { Panel } from '@/components/ui/panel';
import { displayFont } from '@/lib/fonts';
import { GENERAL_SPONSORS } from '@/lib/public/general-sponsors';

export const metadata: Metadata = {
  title: 'Спонсорство',
  description: 'Спонсорские форматы BARSYNERGY для брендов и компаний.'
};

const benefits = [
  {
    icon: Users,
    title: 'Прямой доступ к аудитории',
    description: 'Профессиональная барная среда СКФО: бармены, владельцы, менеджеры, поставщики.'
  },
  {
    icon: Megaphone,
    title: 'Больше точек контакта',
    description: 'Упоминания в событиях, материалах сайта и рассылках.'
  },
  {
    icon: Star,
    title: 'Понятная роль бренда',
    description: 'Показываем, чем бренд полезен специалистам, заведениям и партнёрам.'
  },
  {
    icon: GraduationCap,
    title: 'Совместные форматы',
    description: 'Можно запустить событие, материал, обучение или сезонную программу.'
  }
] as const;

const packageLevels = [
  {
    title: 'Партнёр события',
    description: 'Поддержка отдельного события или инициативы сообщества.',
    price: 'от 50 000 ₽',
    recommended: false,
    items: ['Логотип на странице события', 'Упоминание в анонсах', 'Пост в социальных сетях', 'Материалы на площадке']
  },
  {
    title: 'Сезонный партнёр',
    description: 'Сотрудничество на сезон мероприятий BARSYNERGY.',
    price: 'от 150 000 ₽',
    recommended: false,
    items: ['Всё из пакета события', 'Логотип на событиях сезона', '2 публикации в социальных сетях', 'Интеграция в email-рассылку']
  },
  {
    title: 'Генеральный спонсор',
    description: 'Главное партнёрское место на сезон.',
    price: 'от 300 000 ₽',
    recommended: true,
    items: ['Эксклюзивная категория в сезон', 'Главный логотип на площадках', 'Приветственное слово или интервью', 'Совместные активности и контент']
  }
] as const;

export default function GeneralSponsorsPage() {
  return (
    <>
      <section className="border-b border-[var(--line)] py-10 pt-[118px] md:py-14 md:pt-[132px]">
        <div className="container grid gap-8 lg:grid-cols-[minmax(0,0.95fr)_minmax(20rem,0.72fr)] lg:items-center">
          <div className="min-w-0">
            <p className="text-sm leading-6 text-[var(--muted)]">
              <a className="muted-link" href="/">Главная</a> <span aria-hidden="true">›</span> Спонсорство
            </p>
            <PublicEyebrow className="mt-8">Спонсорство</PublicEyebrow>
            <PublicDisplayTitle as="h1" className="mt-5" size="hero">
              Спонсорство BARSYNERGY
            </PublicDisplayTitle>
            <PublicBodyText className="mt-6 max-w-2xl" size="md">
              Поддерживайте события, обучение и материалы для барной индустрии СКФО. Мы покажем бренд там, где его увидят специалисты и заведения.
            </PublicBodyText>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button className="rounded-[var(--radius-md)] px-7" href="/contacts?topic=sponsorship" size="lg">
                Запросить условия
              </Button>
              <Button className="rounded-[var(--radius-md)] px-7" href="/contacts?topic=sponsorship-presentation" size="lg" variant="secondary">
                Запросить презентацию
              </Button>
            </div>
          </div>
          <div
            aria-hidden="true"
            className="min-h-[300px] rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[url('/images/generated/hustle-brew-lineup-v1.png')] bg-cover bg-center grayscale-[0.08] shadow-[0_24px_60px_rgba(20,20,18,0.08)]"
          />
        </div>
      </section>

      <section className="border-b border-[var(--line)] py-10 md:py-14">
        <div className="container">
          <PublicEyebrow>Что получает бренд</PublicEyebrow>
          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {benefits.map((benefit) => (
              <Panel className="border-[var(--border-default)] bg-[var(--surface-wash)]" key={benefit.title} padding="lg">
                <IconBadge icon={benefit.icon} size="md" tone="accent" />
                <h2 className={`${displayFont.className} mt-5 text-[1.7rem] font-semibold leading-none text-[var(--text)]`}>{benefit.title}</h2>
                <p className="mt-3 text-sm leading-7 text-[var(--muted)]">{benefit.description}</p>
              </Panel>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-[var(--line)] py-10 md:py-14">
        <div className="container">
          <PublicEyebrow>Пакеты спонсорства</PublicEyebrow>
          <div className="mt-6 grid gap-5 lg:grid-cols-3">
            {packageLevels.map((level) => (
              <Panel
                className={
                  level.recommended
                    ? 'relative border-[var(--accent)]/52 bg-[var(--accent-soft)]'
                    : 'border-[var(--border-default)] bg-[var(--surface-wash)]'
                }
                key={level.title}
                padding="lg"
              >
                {level.recommended ? (
                  <span className="absolute -top-3 left-6 rounded-[var(--radius-sm)] bg-[var(--accent)] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--accent-contrast)]">
                    Рекомендуем
                  </span>
                ) : null}
                <h2 className={`${displayFont.className} text-[2rem] font-semibold leading-none text-[var(--text)]`}>{level.title}</h2>
                <p className="mt-4 text-sm leading-7 text-[var(--muted)]">{level.description}</p>
                <div className="mt-6 grid gap-3">
                  {level.items.map((item) => (
                    <FeatureItem icon={BookOpen} key={item} title={item} />
                  ))}
                </div>
                <div className="mt-8 flex items-center justify-between gap-4 border-t border-[var(--line)] pt-5">
                  <p className="text-lg font-semibold text-[var(--text)]">{level.price}</p>
                  <Button
                    className="px-0 text-sm tracking-normal"
                    href={`/contacts?topic=sponsorship&partnerType=${encodeURIComponent(level.title)}`}
                    size="sm"
                    variant="ghost"
                  >
                    Подробнее
                    <ArrowUpRight size={16} />
                  </Button>
                </div>
              </Panel>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-[var(--line)] py-10 md:py-14">
        <div className="container">
          <PublicEyebrow>Генеральный спонсор сезона</PublicEyebrow>
          <div className="mt-6 grid gap-5">
            {GENERAL_SPONSORS.map((sponsor) => (
              <GeneralSponsorCard key={sponsor.id} sponsor={sponsor} />
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-[var(--line)] py-10 md:py-14">
        <div className="container">
          <SectionCtaPanel
            description="Расскажите о своих целях, и команда подберёт формат партнёрства под задачу бренда."
            icon={Handshake}
            primary={{ href: '/contacts?topic=sponsorship', label: 'Оставить заявку' }}
            secondary={{ href: '/contacts?topic=sponsorship-presentation', label: 'Запросить презентацию' }}
            title="Запросить условия"
          />
        </div>
      </section>
    </>
  );
}
