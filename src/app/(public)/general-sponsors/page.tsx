import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { EditorialPublicPage } from '@/components/public/editorial-public-page';
import { PublicBodyText, PublicDisplayTitle, PublicEyebrow } from '@/components/public/public-primitives';
import { EditorialAction } from '@/components/ui/editorial-action';
import { MetaChip } from '@/components/ui/meta-chip';
import { Panel } from '@/components/ui/panel';
import { StatCard } from '@/components/ui/stat-card';

const visibilityRows = [
  {
    label: 'Видимость',
    title: 'Статус на сайте и в ключевых разделах',
    description: 'Приоритетное присутствие на главных точках входа, в сезонных подборках и рядом с важными публикациями.'
  },
  {
    label: 'События',
    title: 'События, обучение и спецпроекты',
    description: 'Интеграции в программы, дегустации, лекции, интенсивы и другие форматы работы с профессиональной аудиторией.'
  },
  {
    label: 'Контент',
    title: 'Контент и долгий отраслевой контакт',
    description: 'Совместные материалы, спецвыпуски и работа с рынком не в одну дату, а на несколько циклов вперед.'
  }
];

const sponsorFormats = [
  'Отдельный пакет присутствия под бренд, сезон и задачу',
  'Интеграции в события, лекции, дегустации и профессиональные встречи',
  'Совместные материалы, подборки и редакционные проекты',
  'Прямая рабочая коммуникация с командой BARSYNERGY'
];

const sponsorShowcase = [
  {
    name: 'AROMA TRADE SOUTH',
    city: 'Ставрополь',
    status: 'Поставщик',
    focus: 'Ингредиенты и расходники',
    note: 'Поставки для ежедневной работы заведений, гостевых смен и образовательных форматов для команд.',
    badges: ['Генеральный партнёр', 'HoReCa'],
    href: '/partners'
  },
  {
    name: 'MONTELIBERO',
    city: 'Пятигорск',
    status: 'Бренд',
    focus: 'Бренд и дистрибуция напитков',
    note: 'Дегустации, спецпроекты и работа с бар-менеджерами, которым важны новые линейки и сезонные запуски.',
    badges: ['Дистрибуция', 'Спецпроекты'],
    href: '/partners'
  },
  {
    name: 'LINEA SERVICE',
    city: 'КМВ',
    status: 'Сервис',
    focus: 'Оборудование и сервис',
    note: 'Оснащение, запуск новых точек и поддержка проектов, где важны стабильная техника и сервисное сопровождение.',
    badges: ['Оборудование', 'Поддержка'],
    href: '/partners'
  }
];

export default function GeneralSponsorsPage() {
  return (
    <>
      <EditorialPublicPage
        eyebrow="Генеральные спонсоры"
        title="Генеральные спонсоры BARSYNERGY"
        description="Формат для брендов и компаний, которым важно регулярно работать с профессиональной аудиторией региона."
        summary="Подходит брендам, дистрибьюторам, производителям и сервисам, которым нужны события, обучение и заметное присутствие в локальной среде."
        summaryHeading="Кому подходит"
        metrics={[
          { value: 'СКФО', label: 'региональный фокус' },
          { value: 'События', label: 'живые интеграции' },
          { value: 'Контент', label: 'долгая видимость' }
        ]}
        rows={[
          {
            label: 'Брендам',
            title: 'Присутствие в отраслевой среде',
            description: 'Для брендов, которым важно системно работать с барной аудиторией, а не ограничиваться разовым выходом.'
          },
          {
            label: 'Дистрибьюторам',
            title: 'Связка с рынком и командами',
            description: 'Для компаний, которым нужны прямые точки касания с заведениями, управляющими, барменами и преподавателями.'
          },
          {
            label: 'Производителям',
            title: 'Форматы под задачу бренда',
            description: 'Для производителей и сервисов, которым нужны образовательные, событийные или контентные интеграции в регионе.'
          }
        ]}
        rowsHeading="Основные направления"
        primaryLink={{ label: 'Обсудить спонсорство', href: '/contacts' }}
        secondaryLink={{ label: 'Партнеры', href: '/partners' }}
      />

      <section className="editorial-grid border-b border-black/20 py-10 md:py-14">
        <div className="container grid gap-8 xl:grid-cols-[0.72fr_1.28fr]">
          <div className="flex flex-col justify-between gap-8">
            <div>
              <PublicEyebrow>Партнёрский каталог</PublicEyebrow>
              <PublicDisplayTitle className="mt-3">Примеры профилей</PublicDisplayTitle>
            </div>
            <div className="max-w-md border-l border-[rgba(191,168,143,0.45)] pl-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--accent)]">
                Каталог для брендов, поставщиков и сервисов
              </p>
              <EditorialAction className="mt-4" href="/partners">
                Перейти к партнёрам
                <ArrowUpRight size={18} />
              </EditorialAction>
            </div>
          </div>
          <div className="grid grid-flow-dense gap-4 md:grid-cols-2 xl:grid-cols-3">
            {sponsorShowcase.map((sponsor) => (
              <Link className="block h-full rounded-[var(--radius-xl)] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--accent)]" href={sponsor.href} key={sponsor.name}>
                <Panel
                  className="flex h-full min-h-[320px] flex-col justify-between overflow-hidden border-[rgba(191,168,143,0.34)] bg-[color-mix(in_oklab,var(--surface),white_28%)]"
                  padding="lg"
                >
                  <div>
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-black/10 pb-4">
                      <PublicEyebrow>{sponsor.city}</PublicEyebrow>
                      <MetaChip className="border-[var(--accent)]/28 px-2.5 py-1 text-[10px] tracking-[0.14em] text-[var(--text)]">
                        {sponsor.status}
                      </MetaChip>
                    </div>
                    <h3 className="mt-5 text-[26px] font-semibold uppercase leading-8 text-[var(--text)]">
                      {sponsor.name}
                    </h3>
                    <p className="mt-3 text-sm font-semibold uppercase tracking-[0.08em] text-[var(--muted)]">
                      {sponsor.focus}
                    </p>
                    <PublicBodyText className="mt-5 pr-2">{sponsor.note}</PublicBodyText>
                  </div>
                  <div className="mt-8 border-t border-black/10 pt-4">
                    <div className="flex flex-wrap gap-2">
                      {sponsor.badges.map((badge) => (
                        <MetaChip
                          className="border-[rgba(191,168,143,0.55)] bg-transparent px-2.5 py-1 text-[10px] tracking-[0.14em] text-[var(--muted)]"
                          key={badge}
                        >
                          {badge}
                        </MetaChip>
                      ))}
                    </div>
                    <div className="mt-5 inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.08em] text-[var(--text)]">
                      <span>Профиль партнёра</span>
                      <ArrowUpRight size={16} />
                    </div>
                  </div>
                </Panel>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-black/20 bg-[var(--graphite)] py-10 text-white md:py-14">
        <div className="container grid gap-8 xl:grid-cols-[0.72fr_1.28fr]">
          <div>
            <PublicDisplayTitle className="text-white">Что входит</PublicDisplayTitle>
            <PublicBodyText className="mt-5 max-w-md" tone="inverse">
              Состав подбираем под бренд, сезон и задачу. Ниже базовые точки, из которых обычно собирается пакет.
            </PublicBodyText>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {visibilityRows.map((row) => (
              <StatCard
                className="h-full border-white/16 bg-[#181817] text-white"
                description={row.description}
                descriptionClassName="text-white/76"
                key={row.title}
                label={row.label}
                labelClassName="text-[#f1b6ad]"
                tone="inverse"
                value={row.title}
                valueClassName="text-lg font-semibold uppercase leading-7 tracking-[0.02em] text-white"
                style={{ backgroundColor: '#181817', borderColor: 'rgba(255,255,255,0.16)', color: '#ffffff' }}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="editorial-grid border-b border-black/20 py-10 md:py-14">
        <div className="container grid gap-8 xl:grid-cols-[0.72fr_1.28fr]">
          <div className="flex flex-col justify-between gap-8">
            <div>
              <PublicDisplayTitle>Формат работы</PublicDisplayTitle>
              <PublicBodyText className="mt-5 max-w-md">
                Сначала обсуждаем задачу бренда, потом собираем точки присутствия и согласуем понятный рабочий план.
              </PublicBodyText>
            </div>
            <EditorialAction href="/contacts">
              Обсудить формат
              <ArrowUpRight size={18} />
            </EditorialAction>
          </div>
          <div className="border-t border-black/20">
            {sponsorFormats.map((item, index) => (
              <div className="grid gap-4 border-b border-black/20 py-5 md:grid-cols-[0.18fr_1fr]" key={item}>
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--accent)]">
                  {String(index + 1).padStart(2, '0')}
                </p>
                <p className="text-xl font-semibold uppercase leading-7">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
