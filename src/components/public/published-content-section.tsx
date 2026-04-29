import { Button } from '@/components/ui/button';
import type { PublishedContentList } from '@/lib/public/content';
import { displayFont } from '@/lib/fonts';

type PublishedContentSectionProps = {
  title: string;
  emptyTitle: string;
  emptyDescription: string;
  content: PublishedContentList;
  basePath: string;
  sectionId?: string;
  emptyAction?: {
    href: string;
    label: string;
  };
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

export function PublishedContentSection({
  title,
  emptyTitle,
  emptyDescription,
  content,
  basePath,
  sectionId,
  emptyAction
}: PublishedContentSectionProps) {
  return (
    <section className="editorial-grid border-b border-black/20 py-10 md:py-14" id={sectionId}>
      <div className="container grid gap-8 xl:grid-cols-[0.72fr_1.28fr]">
        <div>
          <h2 className={`${displayFont.className} display-tight text-[44px] md:text-[58px]`}>{title}</h2>
          <p className="mt-5 max-w-md text-sm leading-7 text-[var(--muted)]">
            Найдено: {content.total}. Страница {content.page} из {content.totalPages}.
          </p>
        </div>

        {content.items.length === 0 ? (
          <div className="border border-black/20 p-6">
            <h3 className="text-xl font-semibold uppercase leading-7">{emptyTitle}</h3>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--muted)]">{emptyDescription}</p>
            {emptyAction ? (
              <Button className="mt-5 min-h-12 rounded-full px-6 tracking-[0.08em]" href={emptyAction.href}>
                {emptyAction.label}
              </Button>
            ) : null}
          </div>
        ) : (
          <div>
            <div className="border-t border-black/20">
              {content.items.map((item) => (
                <article className="grid gap-4 border-b border-black/20 py-6 md:grid-cols-[0.26fr_0.52fr_0.72fr]" key={item.id}>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--accent)]">{item.label ?? 'Запись'}</p>
                    {item.imageUrl ? (
                      <div
                        aria-hidden="true"
                        className="mt-4 aspect-[4/3] border border-black/20 bg-cover bg-center"
                        style={{ backgroundImage: `url("${item.imageUrl}")` }}
                      />
                    ) : null}
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold uppercase leading-7">{item.title}</h3>
                    {item.meta.length > 0 ? (
                      <p className="mt-3 text-xs font-semibold uppercase tracking-[0.08em] text-[var(--muted)]">
                        {item.meta.join(' / ')}
                      </p>
                    ) : null}
                  </div>
                  <p className="max-w-2xl text-sm leading-7 text-[var(--muted)]">{item.summary}</p>
                </article>
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
