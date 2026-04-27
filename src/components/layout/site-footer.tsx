import { ArrowUpRight } from 'lucide-react';
import { displayFont } from '@/lib/fonts';

export function SiteFooter() {
  return (
    <footer>
      <section className="border-t border-black/20 bg-[var(--accent)] text-white">
        <div className="container grid min-h-[320px] gap-6 py-8 md:py-10 lg:grid-cols-[1.2fr_0.7fr_0.5fr] lg:items-end">
          <h2 className={`${displayFont.className} display-tight text-5xl md:text-[88px]`}>
            Будущее индустрии в наших руках.
          </h2>
          <p className="max-w-md pb-1 text-sm leading-6 text-white/84">
            Присоединяйся к BARSYNERGY и стань частью движения, которое меняет индустрию изнутри.
          </p>
          <a
            className="inline-flex min-h-14 items-center justify-center gap-4 border border-white/50 px-6 text-sm font-semibold uppercase tracking-[0.06em] text-white transition hover:border-white hover:bg-white hover:text-[var(--accent)] focus-visible:border-white focus-visible:bg-white focus-visible:text-[var(--accent)] active:translate-y-px"
            href="/contacts"
          >
            Присоединиться
            <ArrowUpRight size={18} />
          </a>
        </div>
      </section>
      <section className="border-t border-black/20 bg-[var(--graphite)] py-8 text-white">
        <div className="container grid gap-8 md:grid-cols-[1fr_auto]">
        <div>
          <p className={`${displayFont.className} display-face text-2xl uppercase`}>BARSYNERGY</p>
          <p className="mt-3 max-w-xl text-sm text-white/68">
            Платформа для образования, событий, контента и деловых возможностей барной индустрии СКФО.
          </p>
        </div>
        <nav className="grid gap-1 text-sm text-white/72 md:justify-items-end md:text-right">
          <a className="flex min-h-11 items-center transition hover:text-white" href="/legal/privacy">
            Политика конфиденциальности
          </a>
          <a className="flex min-h-11 items-center transition hover:text-white" href="/legal/personal-data-consent">
            Согласие на обработку ПДн
          </a>
          <a className="flex min-h-11 items-center transition hover:text-white" href="/legal/terms">
            Условия использования
          </a>
          <a className="flex min-h-11 items-center transition hover:text-white" href="/legal/cookies">
            Cookies и аналитика
          </a>
        </nav>
      </div>
      </section>
    </footer>
  );
}
