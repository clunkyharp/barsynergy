import { ArrowUpRight } from 'lucide-react';
import { EditorialPublicPage } from '@/components/public/editorial-public-page';
import { PublicBodyText, PublicDisplayTitle, PublicEyebrow } from '@/components/public/public-primitives';
import { EditorialAction } from '@/components/ui/editorial-action';
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
    name: 'Aroma Trade South',
    city: 'Ставрополь',
    focus: 'ингредиенты и расходники',
    note: 'Поставки для ежедневной работы заведений, гостевые смены и совместные образовательные форматы.'
  },
  {
    name: 'Montelibero',
    city: 'Пятигорск',
    focus: 'бренд и дистрибуция напитков',
    note: 'Дегустации, спецпроекты, работа с бар-менеджерами и видимость в сезонных подборках.'
  },
  {
    name: 'Linea Service',
    city: 'КМВ',
    focus: 'оборудование и сервис',
    note: 'Оснащение, запуск новых точек, поддержка проектов и интеграции в рабочие материалы платформы.'
  }
];

export default function GeneralSponsorsPage() {
  return (
    <>
      <EditorialPublicPage
        eyebrow="Генеральные спонсоры"
        title="Генеральное спонсорство BARSYNERGY"
        description="Формат для брендов и компаний, которым нужен заметный и долгий контакт с профессиональной аудиторией региона."
        summary="Работаем с брендами, дистрибьюторами, производителями и сервисами, которым важны отраслевые проекты, обучение и прямое присутствие в локальной среде."
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
          <div>
            <PublicDisplayTitle>Примеры профилей</PublicDisplayTitle>
            <PublicBodyText className="mt-5 max-w-md">
              Так может выглядеть блок генеральных спонсоров на живом сайте: с понятной специализацией и коротким контекстом.
            </PublicBodyText>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {sponsorShowcase.map((sponsor) => (
              <Panel className="flex h-full flex-col justify-between bg-white/70" key={sponsor.name} padding="md">
                <div>
                  <PublicEyebrow>{sponsor.city}</PublicEyebrow>
                  <h3 className="mt-3 text-2xl font-semibold uppercase leading-8">{sponsor.name}</h3>
                  <p className="mt-3 text-sm font-semibold uppercase tracking-[0.06em] text-[var(--muted)]">{sponsor.focus}</p>
                </div>
                <PublicBodyText className="mt-5">{sponsor.note}</PublicBodyText>
              </Panel>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-black/20 bg-[var(--graphite)] py-10 text-white md:py-14">
        <div className="container grid gap-8 xl:grid-cols-[0.72fr_1.28fr]">
          <div>
            <PublicDisplayTitle className="text-white">Что входит</PublicDisplayTitle>
            <PublicBodyText className="mt-5 max-w-md" tone="inverse">
              Состав собираем под бренд, сезон и рабочую задачу. Ниже базовые точки, вокруг которых строится пакет.
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
                Обсуждаем задачу бренда, собираем точки присутствия и согласуем рабочий план без лишней упаковки.
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
