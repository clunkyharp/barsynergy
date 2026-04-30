'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { ArrowUpRight, Menu, X } from 'lucide-react';
import { accentFont, displayFont } from '@/lib/fonts';
import { cn } from '@/lib/utils';

type MobileSiteMenuProps = {
  navItems: Array<{
    label: string;
    href: string;
  }>;
  pathname?: string | null;
};

export function MobileSiteMenu({ navItems, pathname }: MobileSiteMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuButtonClassName =
    'inline-flex h-12 w-12 items-center justify-center rounded-full border border-[var(--graphite)] bg-[var(--graphite)] text-white shadow-[0_16px_34px_rgba(20,20,18,0.18)] transition hover:bg-black focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]';

  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = 'hidden';

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  return (
    <>
      <button
        aria-expanded={isOpen}
        aria-label={isOpen ? 'Закрыть меню' : 'Открыть меню'}
        className={cn(menuButtonClassName, 'xl:hidden', isOpen && 'pointer-events-none opacity-0')}
        onClick={() => setIsOpen((open) => !open)}
        type="button"
      >
        {isOpen ? <X size={22} /> : <Menu size={22} />}
      </button>

      {isOpen && typeof document !== 'undefined'
        ? createPortal(
            <div className="fixed inset-0 z-[1100] overflow-y-auto bg-[radial-gradient(circle_at_78%_8%,rgba(153,44,38,0.24),transparent_28rem),linear-gradient(135deg,#10100f_0%,#17120f_58%,#0d0d0c_100%)] text-white">
              <div aria-hidden="true" className="absolute inset-0 bg-[url('/images/grain.svg')] opacity-18" />
              <nav className="container relative grid min-h-[100dvh] content-start py-8">
                <div className="flex items-start justify-between gap-4">
                  <span className={cn(accentFont.className, 'pt-3 text-base uppercase tracking-[0.34em] text-white/72')}>BARSYNERGY</span>
                  <button
                    aria-label="Закрыть меню"
                    className="sticky top-6 z-[1201] inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-white/18 bg-white/10 text-white shadow-[0_16px_34px_rgba(0,0,0,0.22)] backdrop-blur transition hover:bg-white/16 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                    onClick={() => setIsOpen(false)}
                    type="button"
                  >
                    <X size={22} />
                  </button>
                </div>
                <div className="mt-6 grid border-t border-white/14">
                  {navItems.map((item) => (
                    <a
                      className="group/link grid min-h-20 grid-cols-[minmax(0,1fr)_auto] items-center gap-5 border-b border-white/14 text-white transition hover:bg-white/[0.04]"
                      href={item.href}
                      key={item.href}
                      onClick={() => setIsOpen(false)}
                    >
                      <span className={cn(displayFont.className, 'display-tight text-[34px] leading-none sm:text-[46px]')}>
                        {item.label}
                      </span>
                      <ArrowUpRight className="text-white/72 transition group-hover/link:translate-x-1 group-hover/link:-translate-y-1 group-hover/link:text-white" size={24} />
                    </a>
                  ))}
                </div>
                <a
                  className="mt-10 inline-flex min-h-14 w-fit items-center gap-3 rounded-full border border-white/18 px-6 text-sm font-semibold uppercase tracking-[0.1em] text-white transition hover:bg-white hover:text-[var(--graphite)]"
                  href="/contacts"
                  onClick={() => setIsOpen(false)}
                >
                  Написать команде
                  <ArrowUpRight size={18} />
                </a>
              </nav>
            </div>,
            document.body
          )
        : null}
    </>
  );
}
