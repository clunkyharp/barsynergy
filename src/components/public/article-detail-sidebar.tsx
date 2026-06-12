import { ArrowUpRight } from 'lucide-react';
import type { TocItem } from '@/lib/public/content/articles';
import { Button } from '@/components/ui/button';
import { Panel } from '@/components/ui/panel';

type ArticleDetailSidebarProps = {
  toc: TocItem[];
  authorName?: string;
  readingTime?: string;
  cityName?: string;
  publishedAtIso?: string;
  sourceLabel?: string;
  tags: string[];
};

function ArticleTocBlock({ toc }: { toc: TocItem[] }) {
  if (toc.length === 0) return null;

  return (
    <Panel padding="lg">
      <h2 className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--accent)]">
        В материале
      </h2>
      <nav className="mt-4">
        <ul className="grid gap-2">
          {toc.map((item) => (
            <li key={item.id}>
              <a
                className="group inline-flex text-sm leading-6 text-[var(--muted)] transition-colors hover:text-[var(--accent)]"
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
      <h2 className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--accent)]">
        Детали
      </h2>
      <dl className="mt-4 grid gap-3">
        {rows.map((row) => (
          <div className="border-b border-[var(--line)] pb-3 last:border-b-0 last:pb-0" key={row.label}>
            <dt className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
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
      <h2 className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--accent)]">
        Темы
      </h2>
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

function ArticleCtaBlock() {
  return (
    <Panel padding="lg">
      <h2 className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--accent)]">
        Калькулятор себестоимости
      </h2>
      <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
        Рассчитайте себестоимость коктейлей и напитков с учётом ингредиентов, потерь и наценки.
      </p>
      <Button
        className="mt-4 w-full min-w-0 justify-center rounded-[var(--radius-sm)] px-4"
        href="/tools/cost-calculator"
      >
        Открыть калькулятор
        <ArrowUpRight size={16} />
      </Button>
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
  tags
}: ArticleDetailSidebarProps) {
  return (
    <aside className="space-y-4 xl:self-start">
      <ArticleTocBlock toc={toc} />
      <ArticleDetailBlock
        authorName={authorName}
        cityName={cityName}
        publishedAtIso={publishedAtIso}
        readingTime={readingTime}
        sourceLabel={sourceLabel}
      />
      <ArticleTagsBlock tags={tags} />
      <ArticleCtaBlock />
    </aside>
  );
}
