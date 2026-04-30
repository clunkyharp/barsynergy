import type { ReactNode } from 'react';
import { PublicBodyText, PublicDisplayTitle } from '@/components/public/public-primitives';
import { Button } from '@/components/ui/button';
import { EditorialListRow } from '@/components/ui/editorial-list-row';
import { MetaChip } from '@/components/ui/meta-chip';
import { Panel } from '@/components/ui/panel';
import type { PublishedContentList } from '@/lib/public/content';

type PublishedContentSectionProps = {
  title: string;
  emptyTitle: string;
  emptyDescription: string;
  content: PublishedContentList;
  basePath: string;
  sectionId?: string;
  excludedItemIds?: string[];
  emptyAction?: {
    href: string;
    label: string;
  };
  filters?: ReactNode;
};

function pageHref(content: PublishedContentList, basePath: string, page: number) {
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
  return query ? `${basePath}?${query}` : basePath;
}

function detailHref(basePath: string, slug: string) {
  return `${basePath}/${slug}`;
}

export function PublishedContentSection({
  title,
  emptyTitle,
  emptyDescription,
  content,
  basePath,
  sectionId,
  excludedItemIds = [],
  emptyAction,
  filters
}: PublishedContentSectionProps) {
  const visibleItems = content.items.filter((item) => !excludedItemIds.includes(item.id));

  return (
    <section className="editorial-grid border-b border-black/20 py-10 md:py-14" id={sectionId}>
      <div className="container grid gap-8 xl:grid-cols-[0.72fr_1.28fr]">
        <div>
          <PublicDisplayTitle>{title}</PublicDisplayTitle>
          <PublicBodyText className="mt-5 max-w-md">
            Найдено: {content.total}. Страница {content.page} из {content.totalPages}.
          </PublicBodyText>
          {filters ? <div className="mt-6">{filters}</div> : null}
        </div>

        {content.items.length === 0 ? (
          <Panel className="space-y-4" padding="lg">
            <h3 className="text-xl font-semibold uppercase leading-7">{emptyTitle}</h3>
            <PublicBodyText className="max-w-2xl">{emptyDescription}</PublicBodyText>
            {emptyAction ? (
              <Button className="min-h-12 rounded-full px-6 tracking-[0.08em]" href={emptyAction.href}>
                {emptyAction.label}
              </Button>
            ) : null}
          </Panel>
        ) : visibleItems.length === 0 ? (
          <Panel className="space-y-4" padding="lg">
            <h3 className="text-xl font-semibold uppercase leading-7">Других записей пока нет</h3>
            <PublicBodyText className="max-w-2xl">
              Главная рекомендация показана выше. Когда в разделе появятся новые записи по этим условиям, они отобразятся в списке.
            </PublicBodyText>
          </Panel>
        ) : (
          <div>
            <div className="border-t border-black/20">
              {visibleItems.map((item) => (
                <EditorialListRow
                  actionLabel="Подробнее"
                  columns="content"
                  description={item.summary}
                  href={detailHref(basePath, item.slug)}
                  key={item.id}
                  label={item.label ?? 'Запись'}
                  media={
                    item.imageUrl ? (
                      <div
                        aria-hidden="true"
                        className="aspect-[4/3] overflow-hidden rounded-[var(--radius-lg)] border border-black/20 bg-cover bg-center"
                        style={{ backgroundImage: `url("${item.imageUrl}")` }}
                      />
                    ) : null
                  }
                  meta={
                    item.meta.length > 0 ? (
                      <div className="mt-1 flex flex-wrap gap-2">
                        {item.meta.map((entry) => (
                          <MetaChip key={entry} variant="filter">
                            {entry}
                          </MetaChip>
                        ))}
                      </div>
                    ) : null
                  }
                  title={item.title}
                />
              ))}
            </div>

            {content.totalPages > 1 ? (
              <div className="mt-6 flex flex-wrap gap-3">
                <Button disabled={content.page <= 1} href={pageHref(content, basePath, content.page - 1)} variant="secondary">
                  Назад
                </Button>
                <Button disabled={content.page >= content.totalPages} href={pageHref(content, basePath, content.page + 1)} variant="secondary">
                  Вперед
                </Button>
              </div>
            ) : null}
          </div>
        )}
      </div>
    </section>
  );
}
