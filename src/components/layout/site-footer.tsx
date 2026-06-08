'use client';

import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Send } from 'lucide-react';
import { AppLink } from '@/components/ui/app-link';
import { ThemeToggle } from '@/components/layout/theme-toggle';

type SiteFooterProps = {
  userRole?: string | null;
};

export function SiteFooter({ userRole }: SiteFooterProps = {}) {
  const pathname = usePathname();
  const isWorkspacePath =
    pathname?.startsWith('/admin') || pathname?.startsWith('/business/cabinet') || pathname?.startsWith('/auth') || pathname?.startsWith('/profile');
  const aboutHref = '/about';
  const businessHref = userRole === 'BUSINESS' ? '/business/cabinet' : '/business';
  const footerNavClassName = 'grid content-start gap-1 text-sm leading-5 text-[var(--editorial-dark-muted)] md:justify-items-start';
  const footerHeadingClassName =
    'mb-3 flex min-h-4 items-center text-xs font-semibold uppercase leading-none tracking-[0.14em] text-[var(--editorial-dark-text)]';
  const footerLinkClassName =
    'flex min-h-10 min-w-10 items-center rounded-[var(--radius-sm)] py-2 leading-5 transition hover:text-[var(--accent)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)] md:whitespace-nowrap';

  if (isWorkspacePath) {
    return null;
  }

  return (
    <footer>
      <section className="bg-[var(--editorial-dark-surface)] py-9 text-[var(--editorial-dark-text)]" data-theme="dark">
        <div className="container grid gap-8 lg:grid-cols-[minmax(18rem,1.08fr)_minmax(0,1.6fr)] lg:items-start">
          <div>
            <AppLink className="inline-flex min-h-10 w-fit items-center focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]" href="/">
              <Image alt="BARSYNERGY" className="h-auto w-[168px]" height={54} src="/brand/barsynergy-lockup-light.svg" width={252} />
            </AppLink>
            <p className="mt-4 max-w-md text-sm leading-7 text-[var(--editorial-dark-muted)]">
              Рабочая среда для баров и кофеен Северного Кавказа.
            </p>
            <p className="mt-5 text-xs leading-5 text-[var(--editorial-dark-muted)]">© 2026 BARSYNERGY. Все права защищены.</p>
          </div>
          <div className="grid gap-8 sm:grid-cols-2 xl:grid-cols-4">
            <nav className={footerNavClassName}>
              <h3 className={footerHeadingClassName}>Платформа</h3>
              <AppLink className={footerLinkClassName} href={aboutHref}>
                О проекте
              </AppLink>
              <AppLink className={footerLinkClassName} href="/education">
                Обучение
              </AppLink>
              <AppLink className={footerLinkClassName} href="/events">
                События
              </AppLink>
              <AppLink className={footerLinkClassName} href="/vacancies">
                Вакансии
              </AppLink>
              <AppLink className={footerLinkClassName} href={businessHref}>
                Для бизнеса
              </AppLink>
              <AppLink className={footerLinkClassName} href="/consulting">
                Консалтинг
              </AppLink>
              <AppLink className={footerLinkClassName} href="/tools/cost-calculator">
                Калькулятор
              </AppLink>
            </nav>
            <nav className={footerNavClassName}>
              <h3 className={footerHeadingClassName}>Сообщество</h3>
              <AppLink className={footerLinkClassName} href="/partners">
                Партнёры
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
              <AppLink className={footerLinkClassName} href="https://t.me/barsynergy">
                <Send size={14} strokeWidth={1.8} className="mr-1.5 inline-block shrink-0" />
                Telegram
              </AppLink>
            </nav>
            <nav className={footerNavClassName}>
              <h3 className={footerHeadingClassName}>Контакты</h3>
              <AppLink className={footerLinkClassName} href="/contacts">
                Написать команде
              </AppLink>
              <AppLink className={footerLinkClassName} href="/contacts?topic=partnership#contact-form">
                Стать партнёром
              </AppLink>
              <AppLink className={footerLinkClassName} href="/legal/privacy">
                Политика конфиденциальности
              </AppLink>
              <AppLink className={footerLinkClassName} href="/legal/cookies">
                Куки
              </AppLink>
            </nav>
            <nav className={footerNavClassName}>
              <h3 className={footerHeadingClassName}>Кабинет</h3>
              <AppLink className={footerLinkClassName} href="/auth/login">
                Войти
              </AppLink>
              <AppLink className={footerLinkClassName} href="/auth/register/user">
                Регистрация
              </AppLink>
            </nav>
            <div className="col-span-full mt-4 flex justify-start border-t border-[var(--editorial-dark-border)] pt-4 sm:justify-end">
              <ThemeToggle compact />
            </div>
          </div>
        </div>
      </section>
    </footer>
  );
}
