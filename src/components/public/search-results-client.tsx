'use client';

import { useState } from 'react';
import { AppLink } from '@/components/ui/app-link';
import type { PublishedContentItem } from '@/lib/public/content';

export type ContentType = 'article' | 'vacancy' | 'supplier' | 'course' | 'event' | 'partner';

export type SearchResultItem = PublishedContentItem & {
  contentType: ContentType;
  basePath: string;
  actionLabel: string;
};

type TabId = 'all' | ContentType;

const TAB_CONFIG: { id: TabId; label: string }[] = [
  { id: 'all', label: 'Все' },
  { id: 'article', label: 'Материалы' },
  { id: 'vacancy', label: 'Вакансии' },
  { id: 'supplier', label: 'Поставщики' },
  { id: 'course', label: 'Обучение' },
  { id: 'event', label: 'События' },
  { id: 'partner', label: 'Партнёры' },
];

const TYPE_LABEL: Record<ContentType, string> = {
  article: 'Материал',
  vacancy: 'Вакансия',
  supplier: 'Поставщик',
  course: 'Обучение',
  event: 'Событие',
  partner: 'Партнёр',
};

function escapeRegex(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function HighlightedText({ text, query }: { text: string; query: string }) {
  if (!query.trim()) return <>{text}</>;
  const qLower = query.toLowerCase();
  const parts = text.split(new RegExp(`(${escapeRegex(query)})`, 'gi'));
  return (
    <>
      {parts.map((part, i) =>
        part.toLowerCase() === qLower ? (
          <mark key={i} className="bg-transparent font-semibold not-italic text-[var(--accent)]">
            {part}
          </mark>
        ) : (
          part
        )
      )}
    </>
  );
}

function SearchResultRow({
  item,
  query,
  isFirst,
}: {
  item: SearchResultItem;
  query: string;
  isFirst?: boolean;
}) {
  const hasThumb = isFirst && Boolean(item.imageUrl);
  return (
    <li className="border-t border-[var(--line)] first:border-t-0">
      <AppLink
        className={[
          'group flex items-start gap-4 py-5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)]',
          hasThumb
            ? 'md:grid md:grid-cols-[minmax(0,1fr)_auto_auto] md:items-start'
            : 'md:grid md:grid-cols-[minmax(0,1fr)_auto] md:items-center',
        ].join(' ')}
        href={`${item.basePath}/${item.slug}`}
      >
        <span className="min-w-0">
          <span className="flex flex-wrap items-center gap-2">
            <span className="public-route-label">{TYPE_LABEL[item.contentType]}</span>
            {isFirst && (
              <span className="text-[11px] font-medium text-[var(--accent)]">★ Лучшее совпадение</span>
            )}
          </span>
          <span className="mt-2 block text-base font-semibold leading-6 text-[var(--text)] transition-colors group-hover:text-[var(--accent)]">
            <HighlightedText text={item.title} query={query} />
          </span>
          <span className="mt-1 block line-clamp-2 text-sm leading-6 text-[var(--muted)]">
            <HighlightedText text={item.summary} query={query} />
          </span>
          {item.meta.length > 0 && (
            <span className="mt-2 flex flex-wrap items-center gap-1.5 text-[12px] text-[var(--muted)]">
              {item.meta.slice(0, 3).map((entry, i) => (
                <span key={entry} className="flex items-center gap-1.5">
                  {i > 0 && (
                    <span aria-hidden className="select-none">·</span>
                  )}
                  {entry}
                </span>
              ))}
            </span>
          )}
        </span>
        <span className="mt-1 shrink-0 text-sm font-semibold text-[var(--accent)] md:ml-6 md:mt-0">
          {item.actionLabel} →
        </span>
        {hasThumb && (
          <img
            alt=""
            className="hidden h-20 w-28 shrink-0 rounded-[var(--radius-md)] object-cover md:block"
            src={item.imageUrl}
          />
        )}
      </AppLink>
    </li>
  );
}

export function SearchResultsClient({ items, query }: { items: SearchResultItem[]; query: string }) {
  const [activeTab, setActiveTab] = useState<TabId>('all');
  const [sort, setSort] = useState<'relevance' | 'newest'>('relevance');

  const countByType = items.reduce(
    (acc, item) => {
      acc[item.contentType] = (acc[item.contentType] ?? 0) + 1;
      return acc;
    },
    {} as Partial<Record<ContentType, number>>
  );

  const tabItems = TAB_CONFIG.map((tab) => ({
    ...tab,
    count: tab.id === 'all' ? items.length : (countByType[tab.id as ContentType] ?? 0),
  })).filter((tab) => tab.id === 'all' || tab.count > 0);

  let filteredItems =
    activeTab === 'all' ? items : items.filter((item) => item.contentType === activeTab);

  if (sort === 'newest') {
    filteredItems = [...filteredItems].sort((a, b) =>
      (b.dateIso ?? '').localeCompare(a.dateIso ?? '')
    );
  }

  return (
    <div className="grid gap-4">
      <div className="flex gap-2 overflow-x-auto pb-0.5 [scrollbar-width:none]">
        {tabItems.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              className={[
                'inline-flex shrink-0 items-center gap-1.5 rounded-[var(--radius-pill)] border px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)]',
                isActive
                  ? 'border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent)]'
                  : 'border-[var(--line)] bg-transparent text-[var(--muted)] hover:border-[var(--border-default)] hover:text-[var(--text)]',
              ].join(' ')}
              type="button"
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
              <span
                className={[
                  'inline-flex min-w-[1.25rem] items-center justify-center rounded-full px-1 text-[11px] font-semibold leading-[1.4]',
                  isActive
                    ? 'bg-[var(--accent)] text-[var(--accent-contrast)]'
                    : 'bg-[var(--surface-wash)] text-[var(--muted)]',
                ].join(' ')}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {filteredItems.length > 0 ? (
        <div className="rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--surface-card)] shadow-[var(--shadow-card)]">
          <div className="flex items-center justify-between border-b border-[var(--line)] px-5 py-3">
            <p className="text-sm text-[var(--muted)]">
              Результаты по запросу{' '}
              <span className="font-semibold text-[var(--accent)]">"{query}"</span>
            </p>
            <select
              className="border border-[var(--line)] rounded-[var(--radius-md)] bg-[var(--surface-card)] px-3 py-1.5 text-sm text-[var(--text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)]"
              value={sort}
              onChange={(e) => setSort(e.target.value as 'relevance' | 'newest')}
            >
              <option value="relevance">Сначала релевантные</option>
              <option value="newest">Сначала новые</option>
            </select>
          </div>
          <ul className="px-5">
            {filteredItems.map((item, i) => (
              <SearchResultRow key={item.id} item={item} query={query} isFirst={activeTab === 'all' && i === 0} />
            ))}
          </ul>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-3 rounded-[var(--radius-lg)] border border-dashed border-[var(--border-default)] bg-[var(--surface-wash)] py-12 text-center">
          <p className="text-sm text-[var(--muted)]">В этом разделе ничего не найдено</p>
          {activeTab !== 'all' && (
            <button
              className="border border-[var(--accent)] rounded-[var(--radius-pill)] px-4 py-2 text-sm font-medium text-[var(--accent)] transition-colors hover:bg-[var(--accent-soft)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)]"
              onClick={() => setActiveTab('all')}
              type="button"
            >
              Показать все результаты
            </button>
          )}
        </div>
      )}
    </div>
  );
}
