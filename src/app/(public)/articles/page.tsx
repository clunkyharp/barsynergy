import type { Metadata } from 'next';
import { CategoryType } from '@prisma/client';
import { ArticleGridSection } from '@/components/public/article-grid-section';
import { FileText } from 'lucide-react';
import { EditorialPublicPage } from '@/components/public/editorial-public-page';
import { getPublishedArticles, hasActivePublicContentParams, type PublicContentSearchParams } from '@/lib/public/content';
import { getPublicCategoryOptions } from '@/lib/public/filter-options';
import { Button } from '@/components/ui/button';
import { buildPublicPageMetadata } from '@/lib/public/metadata';

type ArticlesPageProps = {
  searchParams?: Promise<PublicContentSearchParams>;
};

export const metadata: Metadata = buildPublicPageMetadata({
  title: 'Материалы',
  description: 'Материалы для работы с меню, сервисом, командой и поставщиками.',
  path: '/articles'
});

export default async function ArticlesPage({ searchParams }: ArticlesPageProps) {
  const params = (await searchParams) ?? {};
  const [content, categories] = await Promise.all([
    getPublishedArticles(params),
    getPublicCategoryOptions(CategoryType.ARTICLE)
  ]);
  const isEmpty = content.total === 0;
  const hasActiveFilters = hasActivePublicContentParams(params, ['q', 'category', 'city', 'tag']);
  const featuredItem = !hasActiveFilters && content.page === 1 ? content.items[0] : undefined;
  const isPrelaunchEmpty = isEmpty && !hasActiveFilters;
  return (
    <>
      <EditorialPublicPage
        eyebrow="Материалы"
        path="/articles"
        title="Материалы"
        description="Статьи, интервью и разборы для работы с меню, сервисом и командой."
        summary={isPrelaunchEmpty ? 'Первые материалы готовятся. Уже можно предложить тему для публикации.' : 'Читайте интервью, разборы, рабочие тексты и подборки.'}
        chips={['Разборы', 'Интервью', 'Практика', 'Подборки']}
        density="compact"
        metrics={[]}
        rows={[]}
        primaryLink={{ label: 'Предложить тему', href: '/contacts?topic=article-topic#contact-form' }}
        accentGradient="radial-gradient(ellipse 90% 60% at 30% 40%, rgba(160,80,200,0.14), transparent)"
        accentIcon={FileText}
      />
      {isPrelaunchEmpty ? (
        <section className="background-zone background-zone-ivory border-b border-[var(--line)] py-16">
          <div className="container text-center">
            <p className="text-[var(--muted)]">Первые материалы готовятся к публикации.</p>
            <Button className="mt-6" href="/contacts?topic=article-topic#contact-form">
              Предложить тему
            </Button>
          </div>
        </section>
      ) : (
        <ArticleGridSection
          basePath="/articles"
          categories={categories}
          content={content}
          featuredItem={featuredItem}
          title="Последние публикации"
        />
      )}
    </>
  );
}
