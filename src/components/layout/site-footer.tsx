'use client';

import Image from 'next/image';
import { usePathname } from 'next/navigation';

export function SiteFooter() {
  const pathname = usePathname();
  const isWorkspacePath =
    pathname?.startsWith('/admin') || pathname?.startsWith('/business') || pathname?.startsWith('/auth');
  const aboutHref = pathname === '/' ? '#home-about' : '/#home-about';
  const footerLinkClassName =
    'flex items-center rounded-[var(--radius-sm)] py-0.5 transition hover:text-[var(--accent)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]';

  if (isWorkspacePath) {
    return null;
  }

  return (
    <footer className="mt-auto">
      <section className="border-t border-[var(--line)] bg-[var(--footer-bg)] py-9 text-[var(--text)]">
        <div className="container grid gap-8 md:grid-cols-[1fr_auto_auto_auto]">
          <div>
            <a className="inline-flex w-fit items-center focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]" href="/">
              <Image alt="BARSYNERGY" className="theme-logo-light h-auto w-[168px]" height={54} src="/brand/barsynergy-lockup.svg" width={252} />
              <Image alt="BARSYNERGY" className="theme-logo-dark h-auto w-[168px]" height={54} src="/brand/barsynergy-lockup-light.svg" width={252} />
            </a>
            <p className="mt-4 max-w-md text-sm leading-7 text-[var(--muted)]">
              Обучение, события, материалы и полезные контакты для барной индустрии СКФО.
            </p>
            <p className="mt-5 text-xs leading-5 text-[var(--muted)]">© 2026 BARSYNERGY. Все права защищены.</p>
          </div>
          <nav className="grid gap-0.5 text-sm leading-6 text-[var(--muted)] md:justify-items-start">
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--text)]">Платформа</p>
            <a className={footerLinkClassName} href={aboutHref}>
              О нас
            </a>
            <a className={footerLinkClassName} href="/education">
              Образование
            </a>
            <a className={footerLinkClassName} href="/events">
              События
            </a>
            <a className={footerLinkClassName} href="/vacancies">
              Вакансии
            </a>
          </nav>
          <nav className="grid gap-0.5 text-sm leading-6 text-[var(--muted)] md:justify-items-start">
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--text)]">Сообщество</p>
            <a className={footerLinkClassName} href="/partners">
              Для партнёров
            </a>
            <a className={footerLinkClassName} href="/suppliers">
              Поставщики
            </a>
            <a className={footerLinkClassName} href="/general-sponsors">
              Спонсорство
            </a>
            <a className={footerLinkClassName} href="/contacts">
              Контакты
            </a>
          </nav>
          <nav className="grid gap-0.5 text-sm leading-6 text-[var(--muted)] md:justify-items-start">
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--text)]">Документы</p>
            <a className={footerLinkClassName} href="/legal/privacy">
              Политика конфиденциальности
            </a>
            <a className={footerLinkClassName} href="/legal/personal-data-consent">
              Согласие на обработку ПДн
            </a>
            <a className={footerLinkClassName} href="/legal/terms">
              Условия использования
            </a>
            <a className={footerLinkClassName} href="/legal/cookies">
              Куки и аналитика
            </a>
          </nav>
        </div>
      </section>
    </footer>
  );
}
