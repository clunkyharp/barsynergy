'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { ArrowUpRight, Menu, X } from 'lucide-react';

type NavItem = {
  label: string;
  href: string;
};

type MobileSiteMenuProps = {
  navItems: NavItem[];
};

export function MobileSiteMenu({ navItems }: MobileSiteMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuId = useId();
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    }

    function handlePointerDown(event: MouseEvent | TouchEvent) {
      const target = event.target as Node | null;

      if (!rootRef.current || !target) {
        return;
      }

      if (!rootRef.current.contains(target)) {
        setIsOpen(false);
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('mousedown', handlePointerDown);
    window.addEventListener('touchstart', handlePointerDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('mousedown', handlePointerDown);
      window.removeEventListener('touchstart', handlePointerDown);
    };
  }, [isOpen]);

  return (
    <div className="xl:hidden" ref={rootRef}>
      <button
        aria-controls={menuId}
        aria-expanded={isOpen}
        aria-label={isOpen ? 'Закрыть меню' : 'Открыть меню'}
        className="inline-flex h-12 w-12 items-center justify-center border border-[var(--graphite)] bg-[var(--graphite)] text-white transition-[background-color,border-color,transform] duration-300 ease-out hover:bg-black active:scale-[0.98]"
        onClick={() => setIsOpen((value) => !value)}
        type="button"
      >
        {isOpen ? (
          <X className="transition-transform duration-300 ease-out" size={22} strokeWidth={2} />
        ) : (
          <Menu className="transition-transform duration-300 ease-out" size={22} strokeWidth={2} />
        )}
      </button>

      {isOpen ? (
        <div
          className="absolute inset-x-0 top-full border-b border-black/20 bg-[var(--surface)] shadow-[0_18px_36px_rgba(20,20,18,0.12)]"
          id={menuId}
        >
          <nav className="container grid py-4">
            {navItems.map((item) => (
              <a
                className="group flex min-h-12 items-center justify-between border-b border-black/12 text-sm font-semibold uppercase tracking-[0.06em] text-[var(--text)] transition-colors duration-300 ease-out hover:text-[var(--accent)] focus-visible:text-[var(--accent)]"
                href={item.href}
                key={item.href}
                onClick={() => setIsOpen(false)}
              >
                <span className="transition-transform duration-300 ease-out group-hover:translate-x-1 group-focus-visible:translate-x-1">
                  {item.label}
                </span>
                <ArrowUpRight
                  className="shrink-0 transition-transform duration-300 ease-out group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-focus-visible:-translate-y-0.5 group-focus-visible:translate-x-0.5"
                  size={17}
                  strokeWidth={1.9}
                />
              </a>
            ))}
            <a
              className="group mt-4 inline-flex min-h-12 items-center justify-center gap-3 border border-[var(--graphite)] bg-[var(--graphite)] px-5 text-sm font-semibold uppercase tracking-[0.06em] text-white transition-[background-color,border-color,transform] duration-300 ease-out hover:bg-black active:scale-[0.99]"
              href="/contacts"
              onClick={() => setIsOpen(false)}
            >
              Присоединиться
              <ArrowUpRight
                className="transition-transform duration-300 ease-out group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                size={18}
              />
            </a>
          </nav>
        </div>
      ) : null}
    </div>
  );
}
