'use client';

import { useState, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

type Section = {
  id: string;
  label: string;
};

type PanelProps = {
  sectionId: string;
  children: ReactNode;
  className?: string;
};

export function ProfileSettingsShell({ sections, defaultSection, children }: { sections: Section[]; defaultSection?: string; children: ReactNode }) {
  const [activeSection, setActiveSection] = useState(defaultSection ?? sections[0]?.id ?? '');

  return (
    <div className="space-y-6">
      <nav aria-label="Разделы настроек" className="flex flex-wrap gap-2">
        {sections.map((s) => (
          <button
            className={cn(
              'inline-flex min-h-9 items-center rounded-[var(--radius-md)] border px-3 text-sm font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]',
              activeSection === s.id
                ? 'border-[var(--accent)]/35 bg-[var(--accent-soft)] text-[var(--accent)]'
                : 'border-[var(--line)] bg-[var(--surface)] text-[var(--muted)] hover:border-[var(--border-hover)] hover:text-[var(--text)]'
            )}
            key={s.id}
            onClick={() => setActiveSection(s.id)}
            type="button"
          >
            {s.label}
          </button>
        ))}
      </nav>
      {children}
    </div>
  );
}

export function ProfileSettingsPanel({ sectionId, children, className }: PanelProps) {
  return (
    <div className={cn(className)} data-section-id={sectionId}>
      {children}
    </div>
  );
}
