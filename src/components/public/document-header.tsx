'use client';

import { ChevronDown, FileText } from 'lucide-react';
import { useState } from 'react';
import { PublicBodyText, PublicBreadcrumbs, PublicDisplayTitle } from '@/components/public/public-primitives';
import { InlineLink } from '@/components/ui/inline-link';
import { cn } from '@/lib/utils';

type DocumentSection = {
  id: string;
  title: string;
};

type DocumentHeaderProps = {
  title: string;
  description: string;
  updatedAt: string;
  sections: DocumentSection[];
  relatedDocuments: { href: string; label: string }[];
};

export function DocumentHeader({
  title,
  description,
  updatedAt,
  sections,
  relatedDocuments
}: DocumentHeaderProps) {
  const [tocOpen, setTocOpen] = useState(false);

  return (
    <section className="border-b border-[var(--line)]">
      <div className="container">
        <div className="pt-4 pb-6 md:pb-8">
          <PublicBreadcrumbs
            current={title}
            items={[{ href: '/', label: 'Главная' }, { href: '/legal', label: 'Юридический раздел' }]}
          />
          <div className="mt-3 flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0">
              <PublicDisplayTitle as="h1" className="mt-1" size="legal">
                {title}
              </PublicDisplayTitle>
              <PublicBodyText className="mt-3 max-w-2xl" size="md">
                {description}
              </PublicBodyText>
              <p className="mt-3 text-xs leading-5 text-[var(--muted)]">
                Актуальная редакция: {updatedAt}
              </p>
            </div>
            <FileText aria-hidden className="mt-2 hidden shrink-0 text-[var(--accent)] lg:block" size={36} strokeWidth={1.2} />
          </div>
        </div>

        {/* Mobile collapsible TOC */}
        <div className="border-t border-[var(--line)] lg:hidden">
          <button
            className="flex w-full items-center justify-between py-3 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--accent)]"
            onClick={() => setTocOpen(!tocOpen)}
            type="button"
          >
            Оглавление
            <ChevronDown
              className={cn(
                'shrink-0 text-[var(--muted)] transition-transform duration-[var(--motion-duration-fast)]',
                tocOpen && 'rotate-180'
              )}
              size={16}
              strokeWidth={1.8}
            />
          </button>
          {tocOpen ? (
            <nav aria-label="Оглавление документа" className="grid gap-1 pb-3">
              {sections.map((section) => (
                <a
                  className="rounded-[var(--radius-sm)] border border-transparent px-3 py-2 text-sm leading-5 text-[var(--muted)] transition-colors hover:border-[var(--border-default)] hover:bg-[var(--surface-wash)] hover:text-[var(--text)]"
                  href={`#${section.id}`}
                  key={section.id}
                  onClick={() => setTocOpen(false)}
                >
                  {section.title.replace(/^\d+\.\s*/, '')}
                </a>
              ))}
              {relatedDocuments.length > 0 ? (
                <div className="mt-2 border-t border-[var(--line)] pt-3">
                  <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--accent)]">Связанные документы</p>
                  {relatedDocuments.map((doc) => (
                    <InlineLink href={doc.href} key={doc.href}>
                      {doc.label}
                    </InlineLink>
                  ))}
                </div>
              ) : null}
            </nav>
          ) : null}
        </div>
      </div>
    </section>
  );
}
