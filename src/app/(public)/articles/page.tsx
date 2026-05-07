import type { Metadata } from 'next';
import { CategoryType } from '@prisma/client';
import { ArrowUpRight } from 'lucide-react';
import { EditorialReadingQueue } from '@/components/public/editorial-display-primitives';
import { EditorialPublicPage } from '@/components/public/editorial-public-page';
import { FeatureCard } from '@/components/public/public-card-patterns';
import { PublicFeaturedContent } from '@/components/public/public-featured-content';
import { FilterChip } from '@/components/public/public-ui-adaptation';
import { Button } from '@/components/ui/button';
import { MetaChip } from '@/components/ui/meta-chip';
import { Panel } from '@/components/ui/panel';
import { displayFont } from '@/lib/fonts';
import { getPublicCategoryOptions } from '@/lib/public/filter-options';
import {
  getPublishedArticles,
  hasActivePublicContentParams,
  type PublishedContentList,
  type PublicContentSearchParams
} from '@/lib/public/content';

type ArticlesPageProps = {
  searchParams?: Promise<PublicContentSearchParams>;
};

export const metadata: Metadata = {
  title: 'Знания',
  description: 'Материалы для работы с меню, сервисом, командой и поставщиками.'
};

const knowledgeTopics = ['Сервис', 'Меню', 'Команда', 'Управление', 'Поставщики', 'Индустрия региона'] as const;

const starterReadingQueueItems = [
  {
    title: 'Как считать себестоимость напитка',
    description: 'Начните с расчёта, если нужно быстро проверить цену позиции.',
    href: '/tools/cost-calculator',
    rubric: 'Калькулятор',
    forWhom: 'бар-менеджер, управляющий, специалист за стойкой',
    willAppear: 'упаковка, граммовка, процент себестоимости и цена продажи',
    type: 'инструмент',
    status: 'открыт',
    actionLabel: 'Открыть калькулятор'
  },
  {
    title: 'Что указать в вакансии',
    description: 'Подходит перед публикацией роли или уточнением условий.',
    href: '/vacancies#submit-vacancy',
    rubric: 'Найм',
    forWhom: 'владелец, управляющий, HR или старший смены',
    willAppear: 'роль, график, оплата, опыт, условия и контакт',
    type: 'чек-лист',
    status: 'для работодателя',
    actionLabel: 'Разместить вакансию'
  },
  {
    title: 'Как выбрать поставщика',
    description: 'Для заведений, которые собирают список рабочих контактов.',
    href: '/suppliers',
    rubric: 'Поставщики',
    forWhom: 'заведение, закупщик, бар-менеджер',
    willAppear: 'категория, география, условия, проверка и контакт',
    type: 'каталог',
    status: 'каталог',
    actionLabel: 'Смотреть каталог'
  },
  {
    title: 'Как подготовить гостевую смену',
    description: 'Для команды, которая хочет предложить встречу или совместный формат.',
    href: '/events?intent=proposal#event-request',
    rubric: 'События',
    forWhom: 'заведение, бренд, школа или команда',
    willAppear: 'тема, площадка, партнёр, роли, анонс и регистрация',
    type: 'план',
    status: 'заявка',
    actionLabel: 'Предложить событие'
  },
  {
    title: 'Карта барной индустрии СКФО',
    description: 'Общий контекст перед чтением материалов и каталогов.',
    href: '/about',
    rubric: 'Регион',
    forWhom: 'специалист, заведение, поставщик или бренд',
    willAppear: 'заведения, поставщики, школы, бренды и события',
    type: 'обзор',
    status: 'контекст',
    actionLabel: 'О проекте'
  }
] as const;

const rubricIndexRows = [
  {
    rubric: 'Сервис',
    purpose: 'Командам зала, бар-менеджерам и наставникам смен.',
    appears: 'Разборы стандартов, работы с гостем и типовых ошибок смены.',
    status: 'сервис',
    href: '/articles?q=сервис',
    actionLabel: 'Открыть рубрику'
  },
  {
    rubric: 'Меню',
    purpose: 'Тем, кто считает себестоимость, обновляет карту и запускает сезонные позиции.',
    appears: 'Материалы про напитки, подачу, цену продажи и рабочие формулы.',
    status: 'меню',
    href: '/articles?q=меню',
    actionLabel: 'Смотреть темы'
  },
  {
    rubric: 'Команда',
    purpose: 'Управляющим, HR и старшим специалистам.',
    appears: 'Чек-листы по найму, адаптации, обучению и внутренним правилам.',
    status: 'команда',
    href: '/contacts?topic=article-topic#contact-form',
    actionLabel: 'Предложить кейс'
  },
  {
    rubric: 'Индустрия региона',
    purpose: 'Специалистам, заведениям, поставщикам и брендам СКФО.',
    appears: 'Интервью, обзоры компаний, событий и локальных инициатив.',
    status: 'регион',
    href: '/contacts?topic=article-interview#contact-form',
    actionLabel: 'Предложить героя'
  }
] as const;

function pageHref(content: PublishedContentList, page: number) {
  const params = new URLSearchParams();

  Object.entries(content.params).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      value.forEach((item) => params.append(key, item));
      return;
    }

    if (value) {
      params.set(key, value);
    }
  });

  if (page > 1) {
    params.set('page', String(page));
  } else {
    params.delete('page');
  }

  const query = params.toString();
  return query ? `/articles?${query}` : '/articles';
}

function topicHref(categories: Awaited<ReturnType<typeof getPublicCategoryOptions>>, topic: string) {
  const category = categories.find((item) => item.name.toLocaleLowerCase('ru').includes(topic.toLocaleLowerCase('ru')));
  return category ? `/articles?category=${category.slug}` : `/articles?q=${encodeURIComponent(topic)}`;
}

function ArticleGridSection({ content, excludedItemId }: { content: PublishedContentList; excludedItemId?: string }) {
  const items = content.items.filter((item) => item.id !== excludedItemId);

  if (items.length === 0) {
    return null;
  }

  return (
    <section className="border-b border-black/20 py-8 md:py-14">
      <div className="container">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--accent)]">Материалы</p>
            <h2 className={`${displayFont.className} mt-3 text-[2.7rem] font-semibold leading-none text-[var(--text)] md:text-[3.45rem]`}>
              Последние публикации
            </h2>
          </div>
          <MetaChip className="border-black/10 bg-[rgba(255,249,242,0.88)] text-[var(--text)]" variant="filter">
            Материалов: {content.total}
          </MetaChip>
        </div>

        <div className="divide-y divide-[var(--line)] border-y border-[var(--line)] md:grid md:gap-5 md:divide-y-0 md:border-y-0 md:grid-cols-2 xl:grid-cols-3">
          {items.map((item) => (
            <article
              className="group transition md:overflow-hidden md:rounded-[var(--radius-lg)] md:border md:border-black/10 md:bg-[rgba(255,250,244,0.76)] md:hover:border-[var(--accent)]/26 md:hover:bg-white/72"
              key={item.id}
            >
              <a className="grid grid-cols-[4.5rem_minmax(0,1fr)] gap-3 py-4 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--accent)] md:block md:py-0" href={`/articles/${item.slug}`}>
                <div
                  aria-hidden="true"
                  className="h-16 rounded-[var(--radius-md)] border border-black/10 bg-[linear-gradient(135deg,var(--surface-muted),white)] bg-cover bg-center grayscale-[0.15] transition-transform duration-700 group-hover:scale-[1.02] md:h-auto md:min-h-[220px] md:rounded-none md:border-x-0 md:border-t-0"
                  style={item.imageUrl ? { backgroundImage: `url("${item.imageUrl}")` } : undefined}
                />
                <div className="min-w-0 md:p-5">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--accent)]">
                    {item.label ?? 'Материал'}
                  </p>
                  <h3 className={`${displayFont.className} mt-2 text-[1.28rem] font-semibold leading-none text-[var(--text)] group-hover:text-[var(--accent)] md:mt-3 md:text-[1.75rem]`}>
                    {item.title}
                  </h3>
                  <p className="mt-3 hidden text-sm leading-7 text-[var(--muted)] sm:block">{item.summary}</p>
                  {(item.updatedLabel || item.meta.length > 0) ? (
                    <div className="mt-3 flex flex-wrap gap-2 md:mt-4">
                      {item.updatedLabel ? (
                        <MetaChip className="border-black/10 bg-transparent text-[var(--muted)]" variant="filter">
                          {item.updatedLabel}
                        </MetaChip>
                      ) : null}
                      {item.meta.slice(0, 3).map((entry) => (
                        <MetaChip className="border-black/10 bg-transparent text-[var(--muted)]" key={entry} variant="filter">
                          {entry}
                        </MetaChip>
                      ))}
                    </div>
                  ) : null}
                  <span className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-[var(--accent)] md:mt-5">
                    Читать материал
                    <ArrowUpRight className="transition group-hover:translate-x-1" size={16} />
                  </span>
                </div>
              </a>
            </article>
          ))}
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-between gap-3 pt-3">
          <MetaChip className="border-black/10 bg-transparent text-[var(--muted)]" variant="default">
            Страница {content.page} из {content.totalPages}
          </MetaChip>
          {content.totalPages > 1 ? (
            <div className="flex flex-wrap gap-3">
              <Button disabled={content.page <= 1} href={pageHref(content, content.page - 1)} variant="secondary">
                Назад
              </Button>
              <Button disabled={content.page >= content.totalPages} href={pageHref(content, content.page + 1)} variant="secondary">
                Вперед
                <ArrowUpRight size={16} />
              </Button>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}

function ArticleEmptyResults() {
  return (
    <section className="border-b border-black/20 py-10 md:py-14">
      <div className="container">
        <Panel className="border-black/10 bg-[rgba(255,250,244,0.72)]" padding="lg">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--accent)]">Знания</p>
          <h2 className={`${displayFont.className} mt-4 text-[2.4rem] font-semibold leading-none text-[var(--text)] md:text-[3rem]`}>
            По этим параметрам материалов нет
          </h2>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-[var(--muted)]">
            Сбросьте выбранную тему или предложите материал, которого сейчас не хватает.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button href="/articles" variant="secondary">
              Сбросить фильтры
            </Button>
            <Button href="/contacts?topic=article-topic#contact-form">
              Предложить тему
            </Button>
          </div>
        </Panel>
      </div>
    </section>
  );
}

function KnowledgeStarterSection() {
  return (
    <section className="background-zone background-zone-ivory border-b border-[var(--line)] py-10 md:py-14">
      <div className="container">
        <EditorialReadingQueue
          className="border-0 py-0"
          description="Несколько коротких входов в раздел: расчёты, найм, поставщики, события и карта рынка."
          eyebrow="Стартовые материалы"
          items={starterReadingQueueItems.map((item, index) => ({
            index: String(index + 1).padStart(2, '0'),
            rubric: item.rubric,
            title: item.title,
            description: item.description,
            forWhom: item.forWhom,
            willAppear: item.willAppear,
            type: item.type,
            status: item.status,
            action: {
              href: item.href,
              label: item.actionLabel
            }
          }))}
          title="С чего начать"
        />
      </div>
    </section>
  );
}

function RubricIndexSection() {
  return (
    <section className="background-zone background-zone-sponsor border-b border-[var(--line)] py-10 md:py-14">
      <div className="container">
        <div className="grid gap-6 lg:grid-cols-[minmax(14rem,0.44fr)_minmax(0,1fr)] lg:items-start">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--accent)]">Знания</p>
            <h2 className={`${displayFont.className} mt-4 max-w-sm text-[2.25rem] font-semibold leading-none text-[var(--text)] md:text-[3.1rem]`}>
              Рубрики
            </h2>
            <p className="mt-5 max-w-md text-sm leading-7 text-[var(--muted)]">
              Выберите тему, посмотрите, кому она полезна, или предложите материал.
            </p>
          </div>
          <div className="grid min-w-0 items-start gap-4 md:grid-cols-2">
            {rubricIndexRows.map((row, index) => (
              <FeatureCard
                action={{ href: row.href, label: row.actionLabel }}
                code={String(index + 1).padStart(2, '0')}
                description={row.appears}
                details={[{ label: 'Для кого', value: row.purpose }]}
                eyebrow={row.status}
                key={row.rubric}
                title={row.rubric}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default async function ArticlesPage({ searchParams }: ArticlesPageProps) {
  const params = (await searchParams) ?? {};
  const [content, categories] = await Promise.all([
    getPublishedArticles(params),
    getPublicCategoryOptions(CategoryType.ARTICLE)
  ]);
  const featuredItem = content.page === 1 ? content.items[0] : undefined;
  const isEmpty = content.total === 0;
  const hasActiveFilters = hasActivePublicContentParams(params, ['q', 'category', 'city', 'tag']);
  const isPrelaunchEmpty = isEmpty && !hasActiveFilters;

  return (
    <>
      <EditorialPublicPage
        eyebrow="Знания"
        title="Статьи, интервью и практические материалы"
        description="Материалы для работы с меню, сервисом, командой, закупками и рынком региона."
        summary={isPrelaunchEmpty ? 'Первые материалы готовятся. Сейчас можно предложить тему или героя интервью.' : 'Читайте интервью, разборы, рабочие тексты и подборки.'}
        metrics={
          isPrelaunchEmpty
            ? []
            : [
                { value: String(content.total), label: 'материалов' },
                { value: 'Публично', label: 'чтение на сайте' },
                { value: 'Практика', label: 'темы для работы' }
              ]
        }
        rows={[
          {
            label: 'Материалы',
            title: 'Редакционные статьи',
            description: 'Практические тексты о сервисе, команде, операционной работе, продуктах и региональном рынке.'
          },
          {
            label: 'Материалы',
            title: 'Интервью и кейсы',
            description: 'Истории специалистов, заведений и партнёров: опыт, решения и ошибки.'
          },
          {
            label: 'Материалы',
            title: 'Гиды и подборки',
            description: 'Гиды и подборки, связанные с обучением, событиями и каталогами.'
          }
        ]}
        primaryLink={{ label: 'Предложить тему', href: '/contacts?topic=article-topic#contact-form' }}
        secondaryLink={isPrelaunchEmpty ? { label: 'Стать героем интервью', href: '/contacts?topic=article-interview#contact-form' } : { label: 'Посмотреть события', href: '/events' }}
      />
      <KnowledgeStarterSection />
      {isPrelaunchEmpty ? (
        <RubricIndexSection />
      ) : (
        <>
          <section className="border-b border-black/20 py-6">
            <div className="container flex flex-wrap gap-3">
              <FilterChip href="/articles" selected={!params.category && !params.q}>
                Все темы
              </FilterChip>
              {knowledgeTopics.map((topic) => (
                <FilterChip href={topicHref(categories, topic)} key={topic}>
                  {topic}
                </FilterChip>
              ))}
            </div>
          </section>
          <PublicFeaturedContent
            actionLabel="Читать материал"
            basePath="/articles"
            eyebrow="Рекомендуем"
            item={featuredItem}
            title="Материал для начала"
          />
          {isEmpty ? <ArticleEmptyResults /> : <ArticleGridSection content={content} excludedItemId={featuredItem?.id} />}
        </>
      )}
    </>
  );
}
