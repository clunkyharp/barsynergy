'use client';

import { ArrowUpRight } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { displayFont } from '@/lib/fonts';

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
        <section className="border-t border-black/20 bg-[var(--accent)] text-white">
          <div className="container grid min-h-[320px] gap-6 py-10 md:py-12 lg:grid-cols-[1.12fr_0.78fr_0.58fr] lg:items-stretch">
            <h2 className={`${displayFont.className} display-tight text-5xl md:text-[88px]`}>
              Есть запрос по барной индустрии?
            </h2>
            <div className="flex h-full flex-col justify-end">
              <p className="max-w-lg pb-1 text-base leading-7 text-white/88 md:text-lg md:leading-8">
                Напишите команде BARSYNERGY: обучение, событие, вакансия, поставщик или партнерство.
              </p>
            </div>
            <div className="flex h-full items-end lg:justify-end">
              <a
                className="inline-flex min-h-16 w-full items-center justify-center gap-4 border border-white/50 px-8 text-base font-semibold uppercase tracking-[0.06em] text-white transition hover:border-white hover:bg-white hover:text-[var(--accent)] focus-visible:border-white focus-visible:bg-white focus-visible:text-[var(--accent)] active:translate-y-px sm:w-fit md:min-h-[72px] md:px-10"
                href="/contacts"
              >
                Написать
                <ArrowUpRight size={18} />
              </a>
            </div>
          </div>
        </section>
      ) : null}
      <section className="border-t border-black/20 bg-[var(--graphite)] py-8 text-white">
        <div className="container grid gap-8 md:grid-cols-[1fr_auto]">
          <div>
            <p className={`${displayFont.className} display-face text-2xl uppercase`}>BARSYNERGY</p>
            <p className="mt-3 max-w-xl text-sm text-white/68">
              Обучение, события, материалы и деловые контакты для барной индустрии СКФО.
            </p>
          </div>
          <nav className="grid gap-2 text-sm text-white/72 md:justify-items-end md:text-right">
            <a className="flex items-center py-1 transition hover:text-white" href="/legal/privacy">
              Политика конфиденциальности
            </a>
            <a className="flex items-center py-1 transition hover:text-white" href="/legal/personal-data-consent">
              Согласие на обработку ПДн
            </a>
            <a className="flex items-center py-1 transition hover:text-white" href="/legal/terms">
              Условия использования
            </a>
            <a className="flex items-center py-1 transition hover:text-white" href="/legal/cookies">
              Куки и аналитика
            </a>
          </nav>
        </div>
      </section>
    </footer>
  );
}
