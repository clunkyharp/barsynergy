'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export const COOKIE_NOTICE_STORAGE_KEY = 'barsynergy_cookie_notice_accepted';
const cookieSettingsPanelId = 'cookie-settings-panel';

export function CookieNotice() {
  const pathname = usePathname();
  const [isVisible, setIsVisible] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const isCostCalculatorPage = pathname === '/tools/cost-calculator';

  useEffect(() => {
    setIsVisible(window.localStorage.getItem(COOKIE_NOTICE_STORAGE_KEY) !== 'true');
  }, []);

  if (!isVisible || pathname?.startsWith('/admin') || pathname?.startsWith('/business/cabinet') || pathname?.startsWith('/auth')) {
    return null;
  }

  function saveCookieChoice() {
    window.localStorage.setItem(COOKIE_NOTICE_STORAGE_KEY, 'true');
    setIsVisible(false);
  }

  return (
    <div
      aria-label="Настройки файлов cookie"
      className={cn(
        isCostCalculatorPage
          ? 'relative z-10 mx-auto my-4 w-[calc(100%-1.5rem)] max-w-[420px]'
          : 'fixed inset-x-3 bottom-[calc(0.75rem+env(safe-area-inset-bottom))] z-40 md:inset-x-auto md:left-1/2 md:right-auto md:w-[min(680px,calc(100%-2rem))] md:-translate-x-1/2'
      )}
      role="region"
    >
      <div className="rounded-[12px] border border-[var(--border-subtle)] bg-[color-mix(in_oklab,var(--paper)_94%,transparent)] p-2 shadow-none md:p-3">
        <div className={cn('grid gap-2 md:grid-cols-[minmax(0,1fr)_auto] md:items-center md:gap-4', isCostCalculatorPage && 'gap-3')}>
          <div className="min-w-0">
            <p className="text-sm font-semibold leading-5 text-[var(--text)]">Файлы куки</p>
            <p className="text-[12px] leading-5 text-[var(--muted)] md:text-[13px]">
              Нужны для работы сайта. Дополнительные куки не включены.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-2 md:w-[260px]">
            <Button className="min-h-11 w-full rounded-[var(--radius-md)] text-sm" onClick={saveCookieChoice} type="button">
              Принять
            </Button>
            <Button
              aria-controls={cookieSettingsPanelId}
              aria-expanded={settingsOpen}
              className="min-h-11 w-full rounded-[var(--radius-md)] text-sm"
              onClick={() => setSettingsOpen((current) => !current)}
              type="button"
              variant="secondary"
            >
              Настроить
            </Button>
          </div>
        </div>
        {settingsOpen ? (
          <div
            className="mt-2 border-t border-[var(--line)] pt-2 text-sm leading-6 text-[var(--muted)]"
            id={cookieSettingsPanelId}
          >
            <p className="font-semibold text-[var(--text)]">Настройки куки</p>
            <label className="mt-2 flex items-start gap-2">
              <input checked className="mt-1 accent-[var(--accent)]" disabled type="checkbox" />
              <span>
                Технические куки обязательны для входа, защиты форм и сохранения сессии. Дополнительные куки на сайте не включены.
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
