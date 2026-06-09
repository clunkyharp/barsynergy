'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';

export const COOKIE_NOTICE_STORAGE_KEY = 'barsynergy_cookie_consent';
const LEGACY_COOKIE_NOTICE_STORAGE_KEY = 'barsynergy_cookie_notice_accepted';
export const COOKIE_NOTICE_TTL_MS = 183 * 24 * 60 * 60 * 1000;
const cookieSettingsPanelId = 'cookie-settings-panel';

export function buildCookieNoticeChoice(now = Date.now()) {
  return JSON.stringify({
    acceptedAt: now,
    expiresAt: now + COOKIE_NOTICE_TTL_MS
  });
}

export function isCookieNoticeChoiceValid(value: string | null, now = Date.now()) {
  if (value === 'true') {
    return true;
  }

  if (!value) {
    return false;
  }

  try {
    const parsed = JSON.parse(value) as { expiresAt?: unknown };

    return typeof parsed.expiresAt === 'number' && parsed.expiresAt > now;
  } catch {
    return false;
  }
}

export function CookieNotice() {
  const pathname = usePathname();
  const [isVisible, setIsVisible] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  useEffect(() => {
    const storedChoice = window.localStorage.getItem(COOKIE_NOTICE_STORAGE_KEY) ?? window.localStorage.getItem(LEGACY_COOKIE_NOTICE_STORAGE_KEY);
    const hasValidChoice = isCookieNoticeChoiceValid(storedChoice);

    if (!hasValidChoice) {
      window.localStorage.removeItem(COOKIE_NOTICE_STORAGE_KEY);
      window.localStorage.removeItem(LEGACY_COOKIE_NOTICE_STORAGE_KEY);
    }

    setIsVisible(!hasValidChoice);
  }, []);

  if (!isVisible || pathname?.startsWith('/admin') || pathname?.startsWith('/business/cabinet') || pathname?.startsWith('/auth') || pathname?.startsWith('/profile')) {
    return null;
  }

  function saveCookieChoice() {
    window.localStorage.setItem(COOKIE_NOTICE_STORAGE_KEY, buildCookieNoticeChoice());
    window.localStorage.removeItem(LEGACY_COOKIE_NOTICE_STORAGE_KEY);
    setIsVisible(false);
  }

  return (
    <div
      aria-label="Настройки файлов cookie"
      className="fixed bottom-[calc(0.75rem+env(safe-area-inset-bottom))] left-3 right-3 z-50 sm:bottom-[calc(1.5rem+env(safe-area-inset-bottom))] sm:left-auto sm:right-6 sm:max-w-[360px]"
      role="region"
    >
      <div className="rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[color-mix(in_oklab,var(--paper)_97%,transparent)] p-3 shadow-[var(--shadow-overlay)] backdrop-blur-md">
        <div className="grid gap-3">
          <div className="min-w-0">
            <p className="text-sm font-semibold leading-5 text-[var(--text)]">Куки для работы сайта</p>
            <p className="text-[12px] leading-5 text-[var(--muted)]">
              Только вход, формы и сессия. Рекламной аналитики нет.
            </p>
          </div>
          <div className="flex w-full gap-2">
            <Button className="min-h-11 flex-1 rounded-[var(--radius-md)] px-4 text-sm" onClick={saveCookieChoice} type="button">
              Принять
            </Button>
            <Button
              aria-controls={cookieSettingsPanelId}
              aria-expanded={settingsOpen}
              className="min-h-11 flex-1 rounded-[var(--radius-md)] px-4 text-sm"
              onClick={() => setSettingsOpen((current) => !current)}
              type="button"
              variant="secondary"
            >
              Подробнее
            </Button>
          </div>
        </div>
        {settingsOpen ? (
          <div
            className="mt-2 border-t border-[var(--line)] pt-2 text-sm leading-6 text-[var(--muted)]"
            id={cookieSettingsPanelId}
          >
            <p className="font-semibold text-[var(--text)]">Подробнее о куки</p>
            <label className="mt-2 flex items-start gap-2">
              <input checked className="mt-1 accent-[var(--accent)]" disabled type="checkbox" />
              <span>
                Технические куки нужны для входа, защиты форм и сохранения сессии. Рекламные и маркетинговые куки не используем.
              </span>
            </label>
            <Button className="mt-3 min-h-11 w-full rounded-[var(--radius-md)]" onClick={saveCookieChoice} type="button">
              Сохранить
            </Button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
