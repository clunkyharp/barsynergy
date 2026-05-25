'use client';

import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { AppLink } from '@/components/ui/app-link';

export function SiteFooter() {
  const pathname = usePathname();
  const isWorkspacePath =
    pathname?.startsWith('/admin') || pathname?.startsWith('/business/cabinet') || pathname?.startsWith('/auth');
  const aboutHref = pathname === '/' ? '#home-about' : '/#home-about';
  const footerNavClassName = 'grid content-start gap-1 text-sm leading-5 text-[var(--muted)] md:justify-items-start';
  const footerHeadingClassName =
    'mb-3 flex min-h-4 items-center text-xs font-semibold uppercase leading-none tracking-[0.14em] text-[var(--text)]';
  const footerLinkClassName =
    'flex min-h-10 min-w-10 items-center rounded-[var(--radius-sm)] py-2 leading-5 transition hover:text-[var(--accent)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)] md:whitespace-nowrap';

  if (isWorkspacePath) {
    return null;
  }

  return (
    <footer className="mt-auto">
      <section className="border-t border-[var(--line)] bg-[var(--footer-bg)] py-9 text-[var(--text)]">
        <div className="container grid gap-8 md:grid-cols-[1fr_auto_auto_auto]">
          <div>
            <AppLink className="inline-flex min-h-10 w-fit items-center focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]" href="/">
              <Image alt="BARSYNERGY" className="theme-logo-light h-auto w-[168px]" height={54} src="/brand/barsynergy-lockup.svg" width={252} />
              <Image alt="BARSYNERGY" className="theme-logo-dark h-auto w-[168px]" height={54} src="/brand/barsynergy-lockup-light.svg" width={252} />
            </AppLink>
            <p className="mt-4 max-w-md text-sm leading-7 text-[var(--muted)]">
              Обучение, события, материалы и полезные контакты для барной индустрии СКФО.
            </p>
            <p className="mt-5 text-xs leading-5 text-[var(--muted)]">© 2026 BARSYNERGY. Все права защищены.</p>
          </div>
          <nav className={footerNavClassName}>
            <p className={footerHeadingClassName}>Платформа</p>
            <AppLink className={footerLinkClassName} href={aboutHref}>
              О нас
            </AppLink>
            <AppLink className={footerLinkClassName} href="/education">
              Образование
            </AppLink>
            <AppLink className={footerLinkClassName} href="/events">
              События
            </AppLink>
            <AppLink className={footerLinkClassName} href="/vacancies">
              Вакансии
            </AppLink>
            <AppLink className={footerLinkClassName} href="/business">
              Для бизнеса
            </AppLink>
            <AppLink className={footerLinkClassName} href="/consulting">
              Консалтинг
            </AppLink>
          </nav>
          <nav className={footerNavClassName}>
            <p className={footerHeadingClassName}>Сообщество</p>
            <AppLink className={footerLinkClassName} href="/partners">
              Для партнёров
            </AppLink>
            <AppLink className={footerLinkClassName} href="/suppliers">
              Поставщики
            </AppLink>
            <AppLink className={footerLinkClassName} href="/general-sponsors">
              Спонсорство
            </AppLink>
            <AppLink className={footerLinkClassName} href="/contacts">
              Контакты
            </AppLink>
          </nav>
          <nav className={footerNavClassName}>
            <p className={footerHeadingClassName}>Документы</p>
            <AppLink className={footerLinkClassName} href="/legal/privacy">
              Политика конфиденциальности
            </AppLink>
            <AppLink className={footerLinkClassName} href="/legal/personal-data-consent">
              Согласие на обработку персональных данных
            </AppLink>
            <AppLink className={footerLinkClassName} href="/legal/terms">
              Условия использования
            </AppLink>
            <AppLink className={footerLinkClassName} href="/legal/cookies">
              Куки и аналитика
            </AppLink>
          </nav>
        </div>
      </section>
    </footer>
  );
}
