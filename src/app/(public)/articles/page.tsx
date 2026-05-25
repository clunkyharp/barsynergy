import type { Metadata } from 'next';
import { CategoryType } from '@prisma/client';
import { ArrowUpRight } from 'lucide-react';
import { Suspense } from 'react';
import { EditorialPublicPage } from '@/components/public/editorial-public-page';
import { PublicFeaturedContent } from '@/components/public/public-featured-content';
import { PublicFilters } from '@/components/public/public-filters';
import { AppLink } from '@/components/ui/app-link';
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

const starterReadingQueueItems = [
  {
    title: 'Как считать себестоимость напитка',
    description: 'Начните с расчёта, если нужно быстро проверить цену позиции.',
    href: '/articles/how-to-calculate-drink-cost',
    rubric: 'Калькулятор',
    forWhom: 'бар-менеджер, управляющий, специалист за стойкой',
    willAppear: 'упаковка, граммовка, процент себестоимости и цена продажи',
    type: 'инструмент',
    status: 'открыт',
    actionLabel: 'Читать инструкцию'
  },
  {
    title: 'Что указать в вакансии',
    description: 'Проверьте роль, график, оплату и условия перед публикацией.',
    href: '/articles/what-to-include-in-vacancy',
    rubric: 'Найм',
    forWhom: 'владелец, управляющий, HR или старший смены',
    willAppear: 'роль, график, оплата, опыт, условия и контакт',
    type: 'чек-лист',
    status: 'для работодателя',
    actionLabel: 'Читать чек-лист'
  },
  {
    title: 'Как выбрать поставщика',
    description: 'Для заведений, которые собирают список рабочих контактов.',
    href: '/articles/how-to-choose-supplier',
    rubric: 'Поставщики',
    forWhom: 'заведение, закупщик, бар-менеджер',
    willAppear: 'категория, география, условия, проверка и контакт',
    type: 'каталог',
    status: 'каталог',
    actionLabel: 'Читать разбор'
  },
  {
    title: 'Как подготовить гостевую смену',
    description: 'Для команды, которая хочет предложить встречу или совместный формат.',
    href: '/articles/how-to-prepare-guest-shift',
    rubric: 'События',
    forWhom: 'заведение, бренд, школа или команда',
    willAppear: 'тема, площадка, партнёр, роли, анонс и регистрация',
    type: 'план',
    status: 'заявка',
    actionLabel: 'Читать план'
  },
  {
    title: 'Карта барной индустрии СКФО',
    description: 'Короткий обзор перед материалами, каталогами и событиями.',
    href: '/articles/skfo-bar-industry-map',
    rubric: 'Регион',
    forWhom: 'специалист, заведение, поставщик или бренд',
    willAppear: 'заведения, поставщики, школы, бренды и события',
    type: 'обзор',
    status: 'контекст',
    actionLabel: 'Читать обзор'
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
          <MetaChip className="border-[var(--border-default)] bg-[var(--surface-wash)] text-[var(--text)]" variant="filter">
            Материалов: {content.total}
          </MetaChip>
        </div>

        <div className="divide-y divide-[var(--line)] border-y border-[var(--line)] md:grid md:gap-6 md:divide-y-0 md:border-y-0 md:grid-cols-2 xl:grid-cols-3">
          {items.map((item) => (
            <article
              className="group transition-[background-color,border-color,color,box-shadow] duration-[var(--motion-duration-base)] ease-[var(--motion-ease-standard)] motion-reduce:transition-none md:overflow-hidden md:rounded-[var(--radius-lg)] md:border md:border-[var(--border-default)] md:bg-[var(--surface-wash)] md:hover:border-[var(--accent)]/26 md:hover:bg-[var(--surface-wash-strong)]"
              key={item.id}
            >
              <AppLink className="grid grid-cols-[4.5rem_minmax(0,1fr)] gap-3 py-4 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--accent)] md:flex md:h-full md:flex-col md:gap-0 md:py-0" href={`/articles/${item.slug}`}>
                <div
                  aria-hidden="true"
                  className="relative h-16 overflow-hidden rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[linear-gradient(135deg,var(--surface-muted),var(--surface))] bg-cover bg-center grayscale-[0.15] transition-transform duration-[var(--motion-duration-media)] ease-[var(--motion-ease-move)] group-hover:scale-[1.02] motion-reduce:transition-none after:absolute after:inset-0 after:bg-[radial-gradient(circle_at_18%_20%,rgba(157,9,14,0.16),transparent_12rem),linear-gradient(135deg,transparent,rgba(255,255,255,0.32))] md:h-auto md:aspect-[1.55/1] md:rounded-none md:border-x-0 md:border-t-0"
                  style={item.imageUrl ? { backgroundImage: `url("${item.imageUrl}")` } : undefined}
                >
                  {!item.imageUrl ? (
                    <span className="absolute inset-0 z-10 hidden flex-col justify-between p-4 text-[var(--accent)] md:flex md:p-5">
                      <span className="text-[10px] font-semibold uppercase tracking-[0.18em] opacity-80">BARSYNERGY</span>
                      <span className={`${displayFont.className} max-w-[10ch] text-[1.8rem] font-semibold leading-[0.98] opacity-35`}>
                        Знания
                      </span>
                    </span>
                  ) : null}
                </div>
                <div className="flex min-w-0 flex-col md:flex-1 md:p-5">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--accent)]">
                    {item.label ?? 'Материал'}
                  </p>
                  <h3 className={`${displayFont.className} mt-2 text-[1.28rem] font-semibold leading-none text-[var(--text)] group-hover:text-[var(--accent)] md:mt-3 md:text-[1.75rem]`}>
                    {item.title}
                  </h3>
                  <p className="mt-3 hidden text-sm leading-7 text-[var(--muted)] sm:block md:line-clamp-3">{item.summary}</p>
                  {(item.updatedLabel || item.meta.length > 0) ? (
                    <div className="mt-3 flex flex-wrap gap-2 md:mt-auto md:pt-5">
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
                  <span className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-[var(--accent)] md:mt-4">
                    Читать материал
                    <ArrowUpRight className="transition-transform duration-[var(--motion-duration-base)] ease-[var(--motion-ease-move)] group-hover:translate-x-1 motion-reduce:transition-none" size={16} />
                  </span>
                </div>
              </AppLink>
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
        <Panel className="border-[var(--border-default)] bg-[var(--surface-wash)]" padding="lg">
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
    <section className="background-zone background-zone-ivory border-b border-[var(--line)] py-8 md:py-10">
      <div className="container">
        <div className="grid gap-4 lg:grid-cols-[minmax(14rem,0.34fr)_minmax(0,1fr)] lg:items-start">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--accent)]">Стартовые материалы</p>
            <h2 className={`${displayFont.className} mt-3 max-w-sm text-[2rem] font-semibold leading-none text-[var(--text)] md:text-[2.6rem]`}>
              С чего начать
            </h2>
            <p className="mt-4 max-w-sm text-sm leading-6 text-[var(--muted)]">
              Короткие входы в расчёты, найм, поставщиков, события и карту рынка.
            </p>
          </div>
          <div className="grid min-w-0 gap-3 sm:grid-cols-2 xl:grid-cols-6">
            {starterReadingQueueItems.map((item, index) => (
              <AppLink
                className={`public-card-shell group flex min-h-[10.5rem] flex-col p-4 transition-colors duration-[var(--motion-duration-base)] ease-[var(--motion-ease-standard)] hover:border-[var(--accent)]/30 hover:bg-[var(--surface-wash-strong)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] motion-reduce:transition-none ${index >= 3 ? 'xl:col-span-3' : 'xl:col-span-2'}`}
                href={item.href}
                key={item.title}
              >
                <div className="flex min-w-0 items-start">
                  <span className="rounded-[var(--radius-sm)] bg-[var(--surface-muted)] px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--accent)]">
                    {item.rubric}
                  </span>
                </div>
                <h3 className={`${displayFont.className} mt-4 text-[1.18rem] font-semibold leading-[1.1] text-[var(--text)] md:text-[1.28rem]`}>
                  {item.title}
                </h3>
                <p className="mt-3 text-sm leading-6 text-[var(--muted)]">{item.description}</p>
                <span className="mt-auto inline-flex items-center gap-2 pt-4 text-sm font-semibold text-[var(--accent)] transition-colors duration-[var(--motion-duration-fast)] ease-[var(--motion-ease-standard)] group-hover:text-[var(--accent-strong)] motion-reduce:transition-none">
                  {item.actionLabel}
                  <ArrowUpRight size={16} strokeWidth={1.8} />
                </span>
              </AppLink>
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
        summary={isPrelaunchEmpty ? 'Первые материалы готовятся. Уже можно предложить тему для публикации.' : 'Читайте интервью, разборы, рабочие тексты и подборки.'}
        metrics={[]}
        rows={[]}
        primaryLink={{ label: 'Предложить тему', href: '/contacts?topic=article-topic#contact-form' }}
        secondaryLink={isPrelaunchEmpty ? undefined : { label: 'Посмотреть события', href: '/events' }}
      />
      <KnowledgeStarterSection />
      {isPrelaunchEmpty ? (
        null
      ) : (
        <>
          <Suspense
            fallback={
              <section className="border-b border-[var(--line)] bg-[var(--surface-muted)] py-6">
                <div className="container">
                  <div aria-hidden="true" className="h-28 animate-pulse rounded-[var(--radius-lg)] bg-[var(--skeleton-fill)]" />
                </div>
              </section>
            }
          >
            <PublicFilters
              activeSummaryLabel="Выбрано в материалах"
              categories={categories}
              categoryAllLabel="Все темы"
              categoryLabel="Тема"
              compact
              description="Поиск по названию, теме или краткому описанию."
              placeholder="Название, тема или описание…"
              title="Фильтры"
            />
          </Suspense>
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
