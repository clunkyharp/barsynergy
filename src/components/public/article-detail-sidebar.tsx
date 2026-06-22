import type { TocItem } from '@/lib/public/content/articles';
import type { PublishedContentItem } from '@/lib/public/content';
import { AppLink } from '@/components/ui/app-link';
import { Panel } from '@/components/ui/panel';
import { ContentSubscribeForm } from '@/components/public/content-subscribe-form';
import { getArticleFallbackImage } from '@/components/public/article-grid-card';

type ArticleDetailSidebarProps = {
  toc: TocItem[];
  authorName?: string;
  readingTime?: string;
  cityName?: string;
  publishedAtIso?: string;
  sourceLabel?: string;
  tags: string[];
  related?: PublishedContentItem[];
  basePath?: string;
  subscribeTopic?: string;
};

const headingClassName =
  'text-[11px] font-semibold uppercase tracking-[var(--tracking-eyebrow-md)] text-[var(--accent)]';

function ArticleTocBlock({ toc }: { toc: TocItem[] }) {
  if (toc.length === 0) return null;

  return (
    <Panel padding="lg">
      <h2 className={headingClassName}>В материале</h2>
      <nav className="mt-4">
        <ul className="grid gap-2">
          {toc.map((item) => (
            <li key={item.id}>
              <a
                className={`group inline-flex text-sm leading-6 text-[var(--muted)] transition-colors hover:text-[var(--accent)] ${item.level === 2 ? 'pl-4 text-[13px]' : ''}`}
                href={`#${item.id}`}
              >
                <span className="mr-2 text-[var(--accent)] opacity-50 transition-opacity group-hover:opacity-100">
                  {item.level === 2 ? '—' : '·'}
                </span>
                <span className="min-w-0 break-words">{item.title}</span>
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </Panel>
  );
}

function ArticleRelatedBlock({
  related,
  basePath
}: {
  related: PublishedContentItem[];
  basePath: string;
}) {
  if (related.length === 0) return null;

  return (
    <Panel padding="lg">
      <h2 className={headingClassName}>Похожие статьи</h2>
      <div className="mt-3">
        {related.map((item) => (
          <AppLink
            className="group flex gap-3.5 border-b border-[var(--border-subtle)] py-3 transition-opacity duration-[var(--motion-duration-fast)] first:pt-0 last:border-b-0 last:pb-0 hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
            href={`${basePath}/${item.slug}`}
            key={item.id}
          >
            <span
              aria-hidden="true"
              className="h-16 w-16 shrink-0 overflow-hidden rounded-[var(--radius-md)] bg-[var(--surface-muted)] bg-cover bg-center"
              style={{ backgroundImage: `url("${item.imageUrl ?? getArticleFallbackImage(item.label)}")` }}
            />
            <span className="min-w-0 flex-1">
              {item.label ? (
                <span className="block text-[11px] font-semibold uppercase tracking-[var(--tracking-eyebrow-sm)] text-[var(--accent)]">
                  {item.label}
                </span>
              ) : null}
              <span className="mt-1 block text-sm font-medium leading-[1.4] text-[var(--text)] line-clamp-2">
                {item.title}
              </span>
            </span>
          </AppLink>
        ))}
      </div>
    </Panel>
  );
}

function ArticleDetailBlock({
  authorName,
  readingTime,
  cityName,
  publishedAtIso,
  sourceLabel
}: {
  authorName?: string;
  readingTime?: string;
  cityName?: string;
  publishedAtIso?: string;
  sourceLabel?: string;
}) {
  const rows: { label: string; value: string }[] = [];
  if (authorName) rows.push({ label: 'Автор', value: authorName });
  if (readingTime) rows.push({ label: 'Время чтения', value: readingTime });
  if (cityName) rows.push({ label: 'Регион', value: cityName });
  if (publishedAtIso) {
    rows.push({
      label: 'Опубликовано',
      value: new Date(publishedAtIso).toLocaleDateString('ru-RU', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      })
    });
  }
  if (sourceLabel) rows.push({ label: 'Источник', value: sourceLabel });

  if (rows.length === 0) return null;

  return (
    <Panel padding="lg">
      <h2 className={headingClassName}>Детали</h2>
      <dl className="mt-4 grid gap-3">
        {rows.map((row) => (
          <div className="border-b border-[var(--line)] pb-3 last:border-b-0 last:pb-0" key={row.label}>
            <dt className="text-[11px] font-semibold uppercase tracking-[var(--tracking-eyebrow-md)] text-[var(--muted)]">
              {row.label}
            </dt>
            <dd className="mt-1.5 text-sm leading-6 text-[var(--text)]">{row.value}</dd>
          </div>
        ))}
      </dl>
    </Panel>
  );
}

function ArticleTagsBlock({ tags }: { tags: string[] }) {
  if (tags.length === 0) return null;

  return (
    <Panel padding="lg">
      <h2 className={headingClassName}>Темы</h2>
      <div className="mt-4 flex flex-wrap gap-1.5">
        {tags.map((tag) => (
          <span
            className="inline-flex items-center rounded-[var(--radius-sm)] border border-[var(--border-subtle)] bg-[var(--surface-wash)] px-2.5 py-1 text-[12px] font-medium leading-[16px] text-[var(--text)]"
            key={tag}
          >
            {tag}
          </span>
        ))}
      </div>
    </Panel>
  );
}

function ArticleSubscribeBlock({ topic }: { topic: string }) {
  return (
    <Panel padding="lg">
      <h2 className={headingClassName}>Подписка</h2>
      <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
        Свежие материалы и разборы для бара и кофейни — раз в неделю, без спама.
      </p>
      <ContentSubscribeForm className="mt-4 max-w-full" label="Узнать о новых материалах" stack topic={topic} />
    </Panel>
  );
}

export function ArticleDetailSidebar({
  toc,
  authorName,
  readingTime,
  cityName,
  publishedAtIso,
  sourceLabel,
  tags,
  related = [],
  basePath = '/articles',
  subscribeTopic = 'articles'
}: ArticleDetailSidebarProps) {
  return (
    <aside className="space-y-4 xl:sticky xl:top-20 xl:self-start">
      <ArticleTocBlock toc={toc} />
      <ArticleDetailBlock
        authorName={authorName}
        cityName={cityName}
        publishedAtIso={publishedAtIso}
        readingTime={readingTime}
        sourceLabel={sourceLabel}
      />
      <ArticleTagsBlock tags={tags} />
      <ArticleRelatedBlock basePath={basePath} related={related} />
      <ArticleSubscribeBlock topic={subscribeTopic} />
    </aside>
  );
}
