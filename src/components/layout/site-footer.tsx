'use client';

import Image from 'next/image';
import type { ReactNode } from 'react';
import { useState } from 'react';
import { ArrowUpRight, ChevronDown } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { AppLink } from '@/components/ui/app-link';
import { displayFont } from '@/lib/fonts';
import { openLeadModal } from '@/lib/public/lead-modal-bus';
import { LeadModalRoot, type LeadModalActions } from '@/components/public/lead-modal-providers';
import { NewsletterModalRoot } from '@/components/public/newsletter-modal';
import { NewsletterModalTrigger } from '@/components/public/newsletter-modal/newsletter-modal-trigger';

type SiteFooterProps = {
  userRole?: string | null;
  userEmail?: string | null;
  newsletterDisabled?: boolean;
  leadActions: LeadModalActions;
};

type FooterCtaConfig = {
  eyebrow: string;
  title: string;
  description: string;
  primaryHref?: string;
  primaryLabel: string;
  primaryAction?: () => void;
  secondaryHref: string;
  secondaryLabel: string;
};

const footerLinkClassName =
  'group inline-flex min-h-10 min-w-10 items-center gap-2 rounded-[var(--radius-sm)] py-2 leading-5 text-[var(--editorial-dark-muted)] transition hover:text-[var(--accent)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)] md:whitespace-nowrap';

function FooterLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <AppLink className={footerLinkClassName} href={href}>
      <span>{children}</span>
    </AppLink>
  );
}

function FooterNavSection({ heading, children }: { heading: string; children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="grid content-start gap-1 text-sm leading-5 text-[var(--editorial-dark-muted)] md:justify-items-start">
      <button
        aria-expanded={isOpen}
        className="flex items-center justify-between border-b border-[var(--editorial-dark-border)] py-3 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--editorial-dark-text)] sm:hidden"
        onClick={() => setIsOpen((v) => !v)}
        type="button"
      >
        {heading}
        <ChevronDown
          className={cn('shrink-0 text-[var(--editorial-dark-muted)] transition-transform duration-[var(--motion-duration-fast)]', isOpen && 'rotate-180')}
          size={16}
          strokeWidth={1.8}
        />
      </button>
      <h3 className="mb-3 hidden min-h-4 items-center text-xs font-semibold uppercase leading-none tracking-[0.14em] text-[var(--editorial-dark-text)] sm:flex">
        {heading}
      </h3>
      <div className={cn(isOpen ? 'flex' : 'hidden', 'flex-col gap-1 sm:contents')}>
        {children}
      </div>
    </nav>
  );
}

export function SiteFooter({ userRole, userEmail, newsletterDisabled = false, leadActions }: SiteFooterProps) {
  const pathname = usePathname();
  const isWorkspacePath =
    pathname?.startsWith('/admin') || pathname?.startsWith('/business/cabinet') || pathname?.startsWith('/auth') || pathname?.startsWith('/profile');
  const businessHref = userRole === 'BUSINESS' ? '/business/cabinet' : '/business';
  const businessLinkLabel = userRole === 'BUSINESS' ? 'Кабинет компании' : 'Разместить компанию';

  const footerCtaConfig: FooterCtaConfig | null = (() => {
    if (!pathname || pathname === '/' || pathname.startsWith('/articles') || pathname.startsWith('/search')) {
      return null;
    }

    if (pathname.startsWith('/vacancies')) {
      return {
        eyebrow: 'Для работодателей',
        title: 'Нужно разместить вакансию для команды?',
        description: 'Оставьте заявку, чтобы команда помогла собрать вакансию и показать её профильной аудитории BARSYNERGY.',
        primaryLabel: 'Разместить вакансию',
        primaryAction: () => openLeadModal('vacancy'),
        secondaryHref: '/business',
        secondaryLabel: 'Каталог для компаний'
      };
    }

    if (pathname.startsWith('/suppliers')) {
      return {
        eyebrow: 'Для компаний',
        title: 'Добавьте компанию в профильный каталог',
        description: 'Если вы представляете заведение, поставщика или сервис, оставьте заявку и мы подскажем, какой формат карточки подойдёт.',
        primaryHref: businessHref,
        primaryLabel: businessLinkLabel,
        secondaryHref: '/contacts?topic=partnership#contact-form',
        secondaryLabel: 'Связаться с нами'
      };
    }

    if (pathname.startsWith('/masters')) {
      return {
        eyebrow: 'Для мастеров',
        title: 'Покажите услугу профильной аудитории',
        description: 'Добавьте специалиста или услугу компании в каталог мастеров, чтобы команды баров могли быстро найти помощь.',
        primaryHref: '/masters#master-submission',
        primaryLabel: 'Стать мастером',
        secondaryHref: businessHref,
        secondaryLabel: businessLinkLabel
      };
    }

    if (pathname.startsWith('/events')) {
      return {
        eyebrow: 'Для организаторов',
        title: 'Есть событие для барного сообщества?',
        description: 'Расскажите о формате, дате и площадке. Подскажем, как лучше опубликовать анонс на BARSYNERGY.',
        primaryLabel: 'Предложить событие',
        primaryAction: () => openLeadModal('event'),
        secondaryHref: '/contacts?topic=partnership#contact-form',
        secondaryLabel: 'Обсудить партнёрство'
      };
    }

    if (pathname.startsWith('/education')) {
      return {
        eyebrow: 'Для команд и школ',
        title: 'Нужна программа обучения или запуск курса?',
        description: 'Оставьте короткую задачу: обучение команды, интенсив, программа для бренда или запуск нового формата.',
        primaryLabel: 'Описать задачу обучения',
        primaryAction: () => openLeadModal('education'),
        secondaryHref: '/contacts?topic=partnership#contact-form',
        secondaryLabel: 'Предложить программу'
      };
    }

    if (pathname.startsWith('/about')) {
      return {
        eyebrow: 'Для бизнеса',
        title: 'Расскажите о своей компании на BARSYNERGY',
        description: 'Размещайте заведения, вакансии, поставщиков и партнёрские форматы для профессиональной аудитории барной индустрии.',
        primaryHref: businessHref,
        primaryLabel: businessLinkLabel,
        secondaryHref: '/contacts#contact-form',
        secondaryLabel: 'Связаться с нами'
      };
    }

    if (pathname.startsWith('/business') || pathname.startsWith('/consulting') || pathname.startsWith('/contacts') || pathname.startsWith('/general-sponsors')) {
      return null;
    }

    return {
      eyebrow: 'Для бизнеса',
      title: 'Расскажите о своей компании на BARSYNERGY',
      description: 'Размещайте заведения, вакансии, поставщиков и партнёрские форматы для профессиональной аудитории барной индустрии.',
      primaryHref: businessHref,
      primaryLabel: businessLinkLabel,
      secondaryHref: '/contacts#contact-form',
      secondaryLabel: 'Связаться с нами'
    };
  })();

  const platformLinks = [
    { href: '/articles', label: 'Материалы' },
    { href: '/education', label: 'Обучение' },
    { href: '/events', label: 'События' },
    { href: '/vacancies', label: 'Вакансии' },
    { href: '/vacancies?view=specialists', label: 'Специалисты' },
    { href: '/masters', label: 'Мастера' },
    { href: '/suppliers', label: 'Поставщики' },
    { href: '/tools/cost-calculator', label: 'Калькулятор' }
  ] as const;
  const businessLinks = [
    { href: businessHref, label: businessLinkLabel },
    { href: '/contacts?topic=partnership#contact-form', label: 'Разместить вакансию' },
    { href: '/partners', label: 'Партнёры' },
    { href: '/consulting', label: 'Консалтинг' },
    { href: '/general-sponsors', label: 'Спонсорство' }
  ] as const;
  const barsynergyLinks = [
    { href: '/about', label: 'О проекте' },
    { href: '/contacts', label: 'Контакты' },
    { href: '/search', label: 'Поиск по сайту' }
  ] as const;

  if (isWorkspacePath) {
    return null;
  }

  return (
    <>
      <LeadModalRoot {...leadActions} />
      <NewsletterModalRoot subscribed={newsletterDisabled} userEmail={userEmail} />
      <NewsletterModalTrigger disabled={newsletterDisabled} />
      <footer>
      {footerCtaConfig ? (
        <section className="border-t border-[var(--editorial-dark-border)] bg-[var(--editorial-dark-surface)] px-0 pb-0 pt-6 text-[var(--editorial-dark-text)] sm:pt-8" data-theme="dark">
          <div className="container">
            <div
              className="overflow-hidden rounded-[calc(var(--radius-xl)+2px)] border border-[var(--editorial-dark-border)] px-5 py-6 sm:px-8 sm:py-8 lg:grid lg:grid-cols-[minmax(0,1.3fr)_auto] lg:items-center lg:gap-8"
              style={{
                backgroundImage:
                  'linear-gradient(135deg, color-mix(in oklab, var(--editorial-dark-surface) 90%, black), color-mix(in oklab, var(--editorial-dark-surface-muted) 88%, black)), radial-gradient(circle at top right, color-mix(in oklab, var(--accent) 16%, transparent), transparent 38%)'
              }}
            >
              <div className="max-w-3xl">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--editorial-dark-label)]">{footerCtaConfig.eyebrow}</p>
                <h2 className={cn(displayFont.className, 'mt-3 max-w-4xl text-[2rem] leading-[1.02] sm:text-[2.6rem]')}>
                  {footerCtaConfig.title}
                </h2>
                <p className="mt-4 max-w-2xl text-sm leading-7 text-[var(--editorial-dark-muted)] sm:text-[1.02rem]">
                  {footerCtaConfig.description}
                </p>
              </div>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row lg:mt-0 lg:justify-self-end">
                {footerCtaConfig.primaryAction ? (
                  <Button onClick={footerCtaConfig.primaryAction} size="lg" type="button">
                    {footerCtaConfig.primaryLabel}
                  </Button>
                ) : footerCtaConfig.primaryHref ? (
                  <Button href={footerCtaConfig.primaryHref} size="lg">
                    {footerCtaConfig.primaryLabel}
                  </Button>
                ) : null}
                <Button href={footerCtaConfig.secondaryHref} size="lg" variant="inverse">
                  {footerCtaConfig.secondaryLabel}
                </Button>
              </div>
            </div>
          </div>
        </section>
      ) : null}

      <section className="bg-[var(--editorial-dark-surface)] py-7 text-[var(--editorial-dark-text)] sm:py-9" data-theme="dark">
        <div className="container grid gap-y-10 pt-8 sm:grid-cols-2 sm:gap-8 sm:pt-10 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.72fr)_minmax(0,0.72fr)_minmax(0,0.62fr)] lg:items-start lg:gap-x-12">
          <div className="sm:col-span-2 lg:col-span-1">
            <AppLink
              className="inline-flex min-h-10 w-fit items-center focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
              href="/"
            >
              <Image alt="BARSYNERGY" className="h-auto w-[168px]" height={54} src="/brand/barsynergy-lockup-light.svg" width={252} />
            </AppLink>
            <p className="mt-4 max-w-sm text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--editorial-dark-label)]">
              Платформа для барной индустрии
            </p>
            <p className="mt-4 max-w-md text-sm leading-7 text-[var(--editorial-dark-muted)] sm:text-[1rem]">
              BARSYNERGY — платформа для размещения и поиска актуальной информации о предстоящих мастер-классах, событиях, вакансиях, поставщиках и возможности сотрудничества с платформой в качестве спонсора.
            </p>
            <div className="mt-7 flex flex-wrap items-center gap-4 text-sm">
              <AppLink
                className="group inline-flex min-h-10 items-center gap-2 rounded-[var(--radius-sm)] border border-[var(--editorial-dark-border)] px-3 py-2 text-[var(--editorial-dark-muted)] transition hover:border-[var(--accent)]/45 hover:text-[var(--accent)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
                href="https://t.me/barsynergy"
                rel="noopener noreferrer"
                target="_blank"
              >
                <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--editorial-dark-label)]">Telegram</span>
                <ArrowUpRight className="transition-transform duration-[var(--motion-duration-base)] ease-[var(--motion-ease-move)] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 motion-reduce:transition-none" size={16} strokeWidth={1.8} />
              </AppLink>
            </div>
          </div>

          <FooterNavSection heading="Платформа">
            {platformLinks.map((link) => (
              <FooterLink href={link.href} key={link.href}>
                {link.label}
              </FooterLink>
            ))}
          </FooterNavSection>

          <FooterNavSection heading="Для бизнеса">
            {businessLinks.map((link) => (
              <FooterLink href={link.href} key={link.href}>
                {link.label}
              </FooterLink>
            ))}
          </FooterNavSection>

          <FooterNavSection heading="BARSYNERGY">
            {barsynergyLinks.map((link) => (
              <FooterLink href={link.href} key={link.href}>
                {link.label}
              </FooterLink>
            ))}
          </FooterNavSection>
        </div>
      </section>

      <div className="border-t border-[var(--editorial-dark-border)] bg-[var(--editorial-dark-surface)]" data-theme="dark">
        <div className="container flex flex-col gap-3 py-4 text-xs text-[var(--editorial-dark-muted)] md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
            <p className="mr-2 text-[var(--editorial-dark-muted)]">© 2026 BARSYNERGY. Все права защищены.</p>
            <FooterLink href="/legal/privacy">Политика конфиденциальности</FooterLink>
            <FooterLink href="/legal/terms">Пользовательское соглашение</FooterLink>
            <FooterLink href="/legal/cookies">Куки</FooterLink>
          </div>
          <p className="text-[var(--editorial-dark-muted)]">Барная индустрия СКФО</p>
        </div>
      </div>
    </footer>
    </>
  );
}
