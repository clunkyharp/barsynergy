import type { Metadata } from 'next';
import { CategoryType } from '@prisma/client';
import { ArrowUpRight, BriefcaseBusiness, Calculator, CalendarDays, Map, Truck } from 'lucide-react';
import { EditorialPublicPage } from '@/components/public/editorial-public-page';
import { PublicFeaturedContent } from '@/components/public/public-featured-content';
import { PublicPrelaunchSection } from '@/components/public/public-prelaunch-section';
import { FilterChip, IconBadge } from '@/components/public/public-ui-adaptation';
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
  description: 'Статьи, интервью и рабочие материалы BARSYNERGY.'
};

const knowledgeTopics = ['Сервис', 'Меню', 'Команда', 'Управление', 'Поставщики', 'Индустрия региона'] as const;

const starterEditorialCards = [
  {
    title: 'Как считать себестоимость напитка',
    description: 'Короткий разбор упаковки, граммовки, процента себестоимости и цены продажи.',
    href: '/tools/cost-calculator',
    label: 'Калькулятор',
    actionLabel: 'Открыть калькулятор',
    icon: Calculator
  },
  {
    title: 'Что указать в вакансии',
    description: 'Чек-лист для заведения: роль, график, оплата, опыт, условия и контакт для откликов.',
    href: '/vacancies#vacancy-submission',
    label: 'Найм',
    actionLabel: 'Разместить вакансию',
    icon: BriefcaseBusiness
  },
  {
    title: 'Как выбрать поставщика',
    description: 'На что смотреть перед первым заказом: категория, география, условия, проверка и контакт.',
    href: '/suppliers',
    label: 'Поставщики',
    actionLabel: 'Смотреть каталог',
    icon: Truck
  },
  {
    title: 'Как подготовить гостевую смену',
    description: 'Мини-план для команды: тема, площадка, партнёр, роли, анонс и регистрация.',
    href: '/events?intent=proposal#applications',
    label: 'События',
    actionLabel: 'Предложить событие',
    icon: CalendarDays
  },
  {
    title: 'Карта барной индустрии СКФО',
    description: 'Заведения, поставщики, школы, бренды и события, которые помогают понять рынок региона.',
    href: '/about',
    label: 'Регион',
    actionLabel: 'О проекте',
    icon: Map
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
    <section className="border-b border-black/20 py-10 md:py-14">
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

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {items.map((item) => (
            <article
              className="group overflow-hidden rounded-[var(--radius-lg)] border border-black/10 bg-[rgba(255,250,244,0.76)] transition hover:border-[var(--accent)]/26 hover:bg-white/72"
              key={item.id}
            >
              <a className="block focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--accent)]" href={`/articles/${item.slug}`}>
                <div
                  aria-hidden="true"
                  className="min-h-[220px] border-b border-black/10 bg-[linear-gradient(135deg,var(--surface-muted),white)] bg-cover bg-center grayscale-[0.15] transition-transform duration-700 group-hover:scale-[1.02]"
                  style={item.imageUrl ? { backgroundImage: `url("${item.imageUrl}")` } : undefined}
                />
                <div className="p-5">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--accent)]">
                    {item.label ?? 'Материал'}
                  </p>
                  <h3 className={`${displayFont.className} mt-3 text-[1.75rem] font-semibold leading-none text-[var(--text)] group-hover:text-[var(--accent)]`}>
                    {item.title}
                  </h3>
                  <p className="mt-3 text-sm leading-7 text-[var(--muted)]">{item.summary}</p>
                  {(item.updatedLabel || item.meta.length > 0) ? (
                    <div className="mt-4 flex flex-wrap gap-2">
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
                  <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[var(--accent)]">
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
            <Button href="/contacts?topic=article-topic">
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
    <section className="border-b border-black/20 py-10 md:py-14">
      <div className="container">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--accent)]">Стартовые материалы</p>
            <h2 className={`${displayFont.className} mt-3 text-[2.35rem] font-semibold leading-none text-[var(--text)] md:text-[3.2rem]`}>
              С чего начать
            </h2>
          </div>
          <p className="max-w-xl text-sm leading-7 text-[var(--muted)]">
            Эти темы уже можно использовать как точки старта, пока редакция наполняет каталог.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {starterEditorialCards.map((card) => {
            const Icon = card.icon;

            return (
              <a
                className="group flex min-h-[246px] flex-col justify-between rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[color-mix(in_oklab,var(--surface),white_18%)] p-5 transition hover:border-[var(--accent)]/28 hover:bg-[color-mix(in_oklab,var(--surface),white_24%)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)]"
                href={card.href}
                key={card.title}
              >
                <span>
                  <span className="flex items-start justify-between gap-4">
                    <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--accent)]">{card.label}</span>
                    <IconBadge icon={Icon} size="sm" tone="soft" />
                  </span>
                  <span className={`${displayFont.className} mt-5 block text-[1.8rem] font-semibold leading-none text-[var(--text)] group-hover:text-[var(--accent)]`}>
                    {card.title}
                  </span>
                  <span className="mt-4 block text-sm leading-7 text-[var(--muted)]">{card.description}</span>
                </span>
                <span className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-[var(--accent)]">
                  {card.actionLabel}
                  <ArrowUpRight className="transition group-hover:translate-x-1" size={16} />
                </span>
              </a>
            );
          })}
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
        description="Статьи, интервью, разборы и практические материалы для специалистов барной индустрии."
        summary={isPrelaunchEmpty ? 'Первые материалы готовятся. Сейчас можно предложить тему или героя интервью.' : 'Все материалы открыты: можно читать интервью, разборы, рабочие тексты и подборки.'}
        metrics={
          isPrelaunchEmpty
            ? []
            : [
                { value: String(content.total), label: 'материалов' },
                { value: 'Открыто', label: 'доступ к материалам' },
                { value: 'Без оплаты', label: 'публичное чтение' }
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
        primaryLink={{ label: 'Предложить тему', href: '/contacts?topic=article-topic' }}
        secondaryLink={isPrelaunchEmpty ? { label: 'Стать героем интервью', href: '/contacts?topic=article-interview' } : { label: 'Посмотреть события', href: '/events' }}
      />
      <KnowledgeStarterSection />
      {isPrelaunchEmpty ? (
        <>
          <PublicPrelaunchSection
            actions={[
              { href: '/contacts?topic=article-topic', label: 'Предложить тему' },
              { href: '/contacts?topic=article-interview', label: 'Стать героем интервью', variant: 'secondary' }
            ]}
            badges={['Материалы готовятся', 'Редакционные темы уже можно присылать']}
            cards={[
              {
                title: 'Сервис',
                description: 'Работа с гостем, сменой и стандартами для команд, которые растут в профессии.'
              },
              {
                title: 'Меню',
                description: 'Сезонные карты, напитки, себестоимость, подача и практические решения по продукту.'
              },
              {
                title: 'Команда',
                description: 'Найм, адаптация и обучение специалистов внутри заведения.'
              },
              {
                title: 'Индустрия региона',
                description: 'Люди, заведения, поставщики и события СКФО, за которыми стоит следить.'
              }
            ]}
            description="Раздел знаний ещё собирается. Пока команда принимает темы, интервью и рабочие кейсы для первых публикаций."
            eyebrow="Знания"
            title="Первые рубрики уже понятны"
          />
        </>
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
