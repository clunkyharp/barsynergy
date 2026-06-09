'use client';

import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

type Section = {
  id: string;
  label: string;
};

export function ProfileTabs({ sections }: { sections: Section[] }) {
  const [activeSection, setActiveSection] = useState(sections[0]?.id ?? '');
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((entry) => entry.isIntersecting);

        if (visible.length > 0) {
          const sorted = visible.sort((a, b) => {
            const aRect = a.boundingClientRect;
            const bRect = b.boundingClientRect;

            return Math.abs(aRect.top) - Math.abs(bRect.top);
          });

          const id = sorted[0]?.target?.id;

          if (id) {
            setActiveSection(id);
          }
        }
      },
      { rootMargin: '-80px 0px -60% 0px', threshold: 0 }
    );

    const targets = sections
      .map((s) => document.getElementById(s.id))
      .filter((el): el is HTMLElement => el !== null);

    targets.forEach((el) => observerRef.current?.observe(el));

    return () => {
      observerRef.current?.disconnect();
    };
  }, [sections]);

  return (
    <nav aria-label="Разделы" className="flex flex-wrap gap-2">
      {sections.map((s) => (
        <a
          className={cn(
            'inline-flex min-h-9 items-center rounded-[var(--radius-md)] border px-3 text-sm font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]',
            activeSection === s.id
              ? 'border-[var(--accent)]/35 bg-[var(--accent-soft)] text-[var(--accent)]'
              : 'border-[var(--line)] bg-[var(--surface)] text-[var(--muted)] hover:border-[var(--border-hover)] hover:text-[var(--text)]'
          )}
          href={`#${s.id}`}
          key={s.id}
        >
          {s.label}
        </a>
      ))}
    </nav>
  );
}
