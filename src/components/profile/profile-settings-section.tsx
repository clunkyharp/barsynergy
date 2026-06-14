'use client';

import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';
import { DisclosurePanel } from '@/components/ui/disclosure-panel';

const STORAGE_KEY = 'profile-section-open';
const OPEN_SECTION_EVENT = 'profile-settings-open-section';

type ProfileSettingsSectionProps = {
  children: ReactNode;
  defaultOpen?: boolean;
  description?: string;
  id: string;
  title: string;
};

function readOpenSections() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : null;
    return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === 'string') : null;
  } catch {
    window.localStorage.removeItem(STORAGE_KEY);
    return null;
  }
}

function writeOpenSection(id: string, isOpen: boolean) {
  const current = readOpenSections() ?? [];
  const next = isOpen ? Array.from(new Set([...current, id])) : current.filter((item) => item !== id);
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
}

export function requestProfileSettingsSectionOpen(id: string) {
  window.dispatchEvent(new CustomEvent(OPEN_SECTION_EVENT, { detail: { id } }));
}

export function ProfileSettingsSection({ children, defaultOpen = false, description, id, title }: ProfileSettingsSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  useEffect(() => {
    const saved = readOpenSections();

    if (saved) {
      setIsOpen(saved.includes(id));
    }
  }, [id]);

  useEffect(() => {
    const openFromHash = () => {
      if (window.location.hash === `#${id}`) {
        setIsOpen(true);
        writeOpenSection(id, true);
      }
    };

    const openFromEvent = (event: Event) => {
      if (!(event instanceof CustomEvent) || event.detail?.id !== id) {
        return;
      }

      setIsOpen(true);
      writeOpenSection(id, true);
    };

    openFromHash();
    window.addEventListener('hashchange', openFromHash);
    window.addEventListener(OPEN_SECTION_EVENT, openFromEvent);

    return () => {
      window.removeEventListener('hashchange', openFromHash);
      window.removeEventListener(OPEN_SECTION_EVENT, openFromEvent);
    };
  }, [id]);

  return (
    <DisclosurePanel
      bodyClassName="border-t border-[var(--line)] px-6 py-6"
      className="group/profile-section inset-panel max-w-2xl scroll-mt-6 overflow-hidden bg-[var(--surface-elevated)] p-0 shadow-[var(--shadow-panel)]"
      description={description}
      id={id}
      onToggle={(event) => {
        const nextOpen = event.currentTarget.open;
        setIsOpen(nextOpen);
        writeOpenSection(id, nextOpen);
      }}
      open={isOpen}
      summaryClassName="px-6 py-5 hover:bg-[var(--surface-wash)] md:grid-cols-[minmax(0,1fr)_auto] md:items-center"
      title={title}
    >
      {children}
    </DisclosurePanel>
  );
}
