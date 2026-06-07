'use client';

import { Search, X } from 'lucide-react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useId, useRef, useState, type FormEvent } from 'react';
import { SearchInput } from '@/components/ui/search-input';

export function ArticleSearchField({ currentQuery = '' }: { currentQuery?: string }) {
  const [open, setOpen] = useState(Boolean(currentQuery));
  const [draftQuery, setDraftQuery] = useState(currentQuery);
  const inputRef = useRef<HTMLInputElement>(null);
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const searchInputId = useId();
  const hasQuery = Boolean(draftQuery.trim() || currentQuery.trim());
  const isActive = open || hasQuery;

  useEffect(() => {
    setDraftQuery(currentQuery);
    if (currentQuery) {
      setOpen(true);
    }
  }, [currentQuery]);

  const buildSearchHref = useCallback(
    (nextQuery: string) => {
      const params = new URLSearchParams(searchParams?.toString() ?? '');

      params.delete('page');

      if (nextQuery) {
        params.set('q', nextQuery);
      } else {
        params.delete('q');
      }

      const query = params.toString();
      return query ? `${pathname}?${query}` : pathname;
    },
    [pathname, searchParams]
  );

  const pushSearch = useCallback(
    (nextQuery: string) => {
      router.push(buildSearchHref(nextQuery), { scroll: false });
    },
    [buildSearchHref, router]
  );

  useEffect(() => {
    const normalizedDraft = draftQuery.trim();
    const normalizedCurrent = currentQuery.trim();

    if (normalizedDraft === normalizedCurrent) {
      return;
    }

    const timerId = window.setTimeout(() => {
      pushSearch(normalizedDraft);
    }, 250);

    return () => {
      window.clearTimeout(timerId);
    };
  }, [currentQuery, draftQuery, pushSearch]);

  const handleSubmit = useCallback(
    (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      pushSearch(draftQuery.trim());
    },
    [draftQuery, pushSearch]
  );

  const handlePrimaryAction = useCallback(() => {
    if (hasQuery) {
      setDraftQuery('');
      setOpen(true);
      inputRef.current?.focus();
      pushSearch('');
      return;
    }

    setOpen((value) => {
      const nextValue = !value;

      if (nextValue) {
        window.setTimeout(() => {
          inputRef.current?.focus();
        }, 150);
      }

      return nextValue;
    });
  }, [hasQuery, pushSearch]);

  return (
    <form className="flex w-full items-center gap-1" onSubmit={handleSubmit}>
      <div
        className="min-w-0 flex-1 transition-[max-width,opacity,transform,visibility] duration-[var(--motion-duration-base)] ease-[var(--motion-ease-standard)] motion-reduce:transition-none"
        style={{
          maxWidth: isActive ? 200 : 0,
          opacity: isActive ? 1 : 0,
          transform: isActive ? 'translateX(0)' : 'translateX(0.5rem)',
          visibility: isActive ? 'visible' : 'hidden'
        }}
      >
        <SearchInput
          aria-label="Поиск по материалам"
          autoComplete="off"
          className="h-8 rounded-full bg-[var(--surface-wash)] pr-3 py-0 text-[13px] text-[var(--text)] outline-none placeholder:text-[var(--muted)] sm:w-48"
          enterKeyHint="search"
          id={searchInputId}
          inputMode="search"
          name="q"
          onChange={(event) => setDraftQuery(event.target.value)}
          placeholder="Поиск..."
          ref={inputRef}
          spellCheck={false}
          type="text"
          value={draftQuery}
        />
      </div>
      <button
        aria-controls={searchInputId}
        aria-expanded={isActive}
        aria-label={hasQuery ? 'Очистить поиск' : isActive ? 'Скрыть поиск' : 'Поиск по материалам'}
        className="inline-flex shrink-0 items-center justify-center rounded-full bg-[var(--surface-wash)] p-2 text-[var(--text-secondary)] transition-colors hover:bg-[var(--surface-muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2"
        onClick={handlePrimaryAction}
        type="button"
      >
        {isActive ? <X size={16} /> : <Search size={16} />}
      </button>
    </form>
  );
}
