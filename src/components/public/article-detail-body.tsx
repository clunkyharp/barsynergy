import type { TocItem } from '@/lib/public/content/articles';
import { ArticleBodyContent } from '@/components/public/article-body-content';
import { ArticleDetailSidebar } from '@/components/public/article-detail-sidebar';
import { Panel } from '@/components/ui/panel';

type ArticleDetailBodyProps = {
  body?: string;
  toc: TocItem[];
  authorName?: string;
  readingTime?: string;
  cityName?: string;
  publishedAtIso?: string;
  tags: string[];
  sourceReferences?: string;
};

export function ArticleDetailBody({
  body,
  toc,
  authorName,
  readingTime,
  cityName,
  publishedAtIso,
  tags,
  sourceReferences
}: ArticleDetailBodyProps) {
  const hasBody = Boolean(body?.trim());

  return (
    <section className="background-zone background-zone-graphite border-b border-[var(--line)] py-9 md:py-12">
      <div className="container">
        <div className="grid gap-8 xl:grid-cols-[1fr_minmax(18rem,0.38fr)] xl:gap-12">
          <div className="min-w-0">
            {hasBody ? (
              <div className="max-w-[70ch]">
                <ArticleBodyContent markdown={body!} />
              </div>
            ) : (
              <p className="text-sm leading-7 text-[var(--muted)]">
                Основная информация.
              </p>
            )}

            {sourceReferences ? (
              <Panel className="mt-12 border-[var(--border-default)] bg-[var(--surface-wash-strong)]" padding="lg">
                <h2 className="text-[11px] font-semibold uppercase tracking-[var(--tracking-eyebrow-md)] text-[var(--accent)]">
                  Источники и дополнительные данные 
                </h2>
                <div className="article-body mt-5">
                  <ArticleBodyContent markdown={sourceReferences} />
                </div>
              </Panel>
            ) : null}
          </div>

          <ArticleDetailSidebar
            authorName={authorName}
            cityName={cityName}
            publishedAtIso={publishedAtIso}
            readingTime={readingTime}
            tags={tags}
            toc={toc}
          />
        </div>
      </div>
    </section>
  );
}
