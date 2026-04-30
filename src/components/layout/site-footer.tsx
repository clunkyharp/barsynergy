'use client';

import { ArrowUpRight } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { accentFont, displayFont } from '@/lib/fonts';

export function SiteFooter() {
  const pathname = usePathname();
  const isWorkspacePath =
    pathname?.startsWith('/admin') || pathname?.startsWith('/business') || pathname?.startsWith('/auth');

  if (isWorkspacePath) {
    return null;
  }

  const showContactCta = true;

  return (
    <footer>
      {showContactCta ? (
        <section className="border-t border-black/12 bg-[var(--graphite)] text-white">
          <div className="container grid min-h-[320px] gap-8 py-14 md:py-18 lg:grid-cols-[1fr_0.9fr_0.62fr] lg:items-center">
          <div>
            <h2 className={`${displayFont.className} display-tight max-w-3xl text-[38px] md:text-[56px] xl:text-[64px]`}>
              Обратная связь с командой BARSYNERGY
            </h2>
            </div>
            <div className="flex h-full flex-col justify-end">
              <p className="max-w-lg pb-1 text-base leading-8 text-white/76 md:text-lg">
                Напишите, если нужно добавить программу, событие, вакансию, поставщика, партнерство или спонсорский формат.
              </p>
            </div>
            <div className="flex h-full items-end lg:justify-end">
              <a
                className="inline-flex min-h-16 w-full items-center justify-center gap-4 rounded-full border border-white/22 px-8 text-base font-semibold uppercase tracking-[0.08em] text-white transition hover:border-white hover:bg-white hover:text-[var(--graphite)] focus-visible:border-white focus-visible:bg-white focus-visible:text-[var(--graphite)] active:translate-y-px sm:w-fit md:min-h-[72px] md:px-10"
                href="/contacts"
              >
                Связаться
                <ArrowUpRight size={18} />
              </a>
            </div>
          </div>
        </section>
      ) : null}
      <section className="border-t border-white/8 bg-black py-10 text-white">
        <div className="container grid gap-8 md:grid-cols-[1fr_auto_auto]">
          <div>
            <p className={`${accentFont.className} text-base uppercase tracking-[0.18em] text-white`}>BARSYNERGY</p>
            <p className="mt-3 max-w-xl text-sm leading-7 text-white/62">
              Обучение, события, материалы и деловые контакты для барной индустрии СКФО.
            </p>
          </div>
          <nav className="grid gap-0.5 text-sm leading-6 text-white/72 md:justify-items-end md:text-right">
            <a className="flex items-center py-0.5 transition hover:text-white" href="/about">
              О проекте
            </a>
            <a className="flex items-center py-0.5 transition hover:text-white" href="/partners">
              Партнерства
            </a>
            <a className="flex items-center py-0.5 transition hover:text-white" href="/general-sponsors">
              Спонсоры
            </a>
          </nav>
          <nav className="grid gap-0.5 text-sm leading-6 text-white/72 md:justify-items-end md:text-right">
            <a className="flex items-center py-0.5 transition hover:text-white" href="/legal/privacy">
              Политика конфиденциальности
            </a>
            <a className="flex items-center py-0.5 transition hover:text-white" href="/legal/personal-data-consent">
              Согласие на обработку ПДн
            </a>
            <a className="flex items-center py-0.5 transition hover:text-white" href="/legal/terms">
              Условия использования
            </a>
            <a className="flex items-center py-0.5 transition hover:text-white" href="/legal/cookies">
              Куки и аналитика
            </a>
          </nav>
        </div>
      </section>
    </footer>
  );
}
