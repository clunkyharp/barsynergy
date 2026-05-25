'use client';

import { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';
import { cn } from '@/lib/utils';

type Theme = 'light' | 'dark';

type ThemeToggleProps = {
  className?: string;
  compact?: boolean;
};

function getInitialTheme(): Theme {
  if (typeof window === 'undefined') {
    return 'light';
  }

  const storedTheme = window.localStorage.getItem('barsynergy-theme');

  if (storedTheme === 'light' || storedTheme === 'dark') {
    return storedTheme;
  }

  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function applyTheme(theme: Theme) {
  document.documentElement.dataset.theme = theme;
  document.documentElement.style.colorScheme = theme;
  window.localStorage.setItem('barsynergy-theme', theme);
}

export function ThemeToggle({ className, compact = false }: ThemeToggleProps) {
  const [theme, setTheme] = useState<Theme>('light');

  useEffect(() => {
    const initialTheme = getInitialTheme();
    setTheme(initialTheme);
    applyTheme(initialTheme);
  }, []);

  const isDark = theme === 'dark';

  return (
    <button
      aria-label={isDark ? 'Включить светлую тему' : 'Включить тёмную тему'}
      aria-pressed={isDark}
      className={cn(
        'inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--surface-elevated)] px-3 text-[12px] font-semibold text-[var(--text)] shadow-[var(--shadow-card)] transition-[background-color,border-color,color,box-shadow] duration-[var(--motion-duration-fast)] ease-[var(--motion-ease-standard)] hover:border-[var(--accent)]/40 hover:text-[var(--accent)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)] motion-reduce:transition-none',
        compact ? 'h-11 w-11 px-0' : 'whitespace-nowrap',
        className
      )}
      onClick={() => {
        const nextTheme = isDark ? 'light' : 'dark';
        setTheme(nextTheme);
        applyTheme(nextTheme);
      }}
      type="button"
    >
      {isDark ? <Sun size={16} strokeWidth={1.9} /> : <Moon size={16} strokeWidth={1.9} />}
      {compact ? null : <span>{isDark ? 'Светлая' : 'Тёмная'}</span>}
    </button>
  );
}
