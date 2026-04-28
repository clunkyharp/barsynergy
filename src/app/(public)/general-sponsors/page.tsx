import { ArrowUpRight } from 'lucide-react';
import { EditorialPublicPage } from '@/components/public/editorial-public-page';
import { displayFont } from '@/lib/fonts';

const visibilityRows = [
  {
    label: '01',
    title: 'Главная страница',
    description: 'С главной страницы ведет отдельная ссылка на генеральных спонсоров.'
  },
  {
    label: '02',
    title: 'Навигация сайта',
    description: 'Раздел доступен из верхнего меню и списка основных публичных разделов.'
  },
  {
    label: '03',
    title: 'Партнерские материалы',
    description: 'Спонсор может быть связан с событиями, образовательными программами и спецпроектами.'
  }
];

const sponsorFormats = [
  'Статус генерального спонсора проекта',
  'Приоритетное упоминание в публичных разделах',
  'Совместные образовательные и отраслевые проекты',
  'Отдельная коммуникация с командой BARSYNERGY'
];

export default function GeneralSponsorsPage() {
  return (
    <>
      <EditorialPublicPage
        eyebrow="Генеральные спонсоры"
        title="Генеральные спонсоры BARSYNERGY"
        description="Отдельная страница для компаний, которые поддерживают проект и хотят быть видны на сайте."
        summary="У спонсора есть отдельное место на сайте, ссылка с главной страницы и прямой формат связи с командой."
        metrics={[
          { value: '01', label: 'отдельный экран' },
          { value: 'Главная', label: 'заметный вход' },
          { value: 'СКФО', label: 'отраслевой фокус' }
        ]}
        rows={[
          {
            label: 'Позиция',
            title: 'Не обычный партнерский список',
            description: 'Этот раздел отделяет генеральных спонсоров от обычного партнерского каталога.'
          },
          {
            label: 'Аудитория',
            title: 'Бары, бренды, школы и сервисы',
            description: 'Формат подходит компаниям, которым нужны отраслевые контакты, образовательные проекты и присутствие в регионе.'
          },
          {
            label: 'Старт',
            title: 'Сначала заявка и обсуждение',
            description: 'Мы обсуждаем задачи бренда, формат участия и точки присутствия на сайте.'
          }
        ]}
        primaryLink={{ label: 'Обсудить спонсорство', href: '/contacts' }}
        secondaryLink={{ label: 'Партнеры', href: '/partners' }}
      />

      <section className="border-b border-black/20 bg-[var(--graphite)] py-10 text-white md:py-14">
        <div className="container grid gap-8 xl:grid-cols-[0.72fr_1.28fr]">
          <div>
            <h2 className={`${displayFont.className} display-tight text-[44px] md:text-[58px]`}>
              Где это видно
            </h2>
            <p className="mt-5 max-w-md text-sm leading-7 text-white/70">
              Страница не спрятана внутри каталога партнеров. У нее есть отдельный адрес и несколько входов с публичных страниц.
            </p>
          </div>
          <div className="grid gap-0 border border-white/16 md:grid-cols-3">
            {visibilityRows.map((row) => (
              <article className="border-b border-white/16 p-5 md:border-b-0 md:border-r md:last:border-r-0" key={row.title}>
                <p className={`${displayFont.className} display-face text-4xl leading-none text-[var(--accent)]`}>
                  {row.label}
                </p>
                <h3 className="mt-5 text-lg font-semibold uppercase leading-7">{row.title}</h3>
                <p className="mt-3 text-sm leading-6 text-white/70">{row.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="editorial-grid border-b border-black/20 py-10 md:py-14">
        <div className="container grid gap-8 xl:grid-cols-[0.72fr_1.28fr]">
          <div className="flex flex-col justify-between gap-8">
            <div>
              <h2 className={`${displayFont.className} display-tight text-[44px] md:text-[58px]`}>
                Формат участия
              </h2>
              <p className="mt-5 max-w-md text-sm leading-7 text-[var(--muted)]">
                Формат подбирается под задачи бренда: заметность на сайте, участие в проектах и совместные инициативы.
              </p>
            </div>
            <a
              className="editorial-link inline-flex min-h-11 w-fit items-center gap-3 border-b border-[var(--text)] text-sm font-semibold uppercase tracking-[0.06em]"
              href="/contacts"
            >
              Связаться с командой
              <ArrowUpRight size={18} />
            </a>
          </div>
          <div className="border-t border-black/20">
            {sponsorFormats.map((item, index) => (
              <div className="grid gap-4 border-b border-black/20 py-5 md:grid-cols-[0.18fr_1fr]" key={item}>
                <p className={`${displayFont.className} display-face text-3xl leading-none text-[var(--accent)]`}>
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
