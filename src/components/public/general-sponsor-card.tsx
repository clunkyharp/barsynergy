import Image from 'next/image';
import type { ReactNode } from 'react';
import { ArrowUpRight, AtSign, Globe2, Mail, MessageCircle, Phone, Send } from 'lucide-react';
import { PublicBodyText, PublicEyebrow } from '@/components/public/public-primitives';
import { CardActionRow } from '@/components/public/public-ui-adaptation';
import { Button } from '@/components/ui/button';
import { Panel } from '@/components/ui/panel';
import { displayFont } from '@/lib/fonts';
import type { GeneralSponsor, GeneralSponsorLinkKind } from '@/lib/public/general-sponsors';

type GeneralSponsorCardProps = {
  priority?: boolean;
  sponsor: GeneralSponsor;
  variant?: 'full' | 'home';
};

function sponsorVisualState(status: string) {
  return /архив|заверш|неактив|inactive|archived/i.test(status) ? 'archived' : 'active';
}

function sponsorAnchorId(slug: string) {
  return `general-sponsor-${slug}`;
}

function SponsorContactCompactLink({
  actionLabel,
  children,
  href,
  icon: Icon,
  kind,
  label
}: {
  actionLabel: string;
  children: ReactNode;
  href: string;
  icon: typeof Globe2;
  kind: string;
  label: string;
}) {
  const isExternal = href.startsWith('http');

  return (
    <a
      aria-label={`${actionLabel}: ${label}`}
      className="sponsor-contact-compact-link group grid min-w-0 grid-cols-[2.25rem_minmax(0,1fr)] gap-3 border-b border-[var(--line)] py-3 transition-colors duration-[var(--motion-duration-base)] ease-[var(--motion-ease-standard)] last:border-b-0 hover:bg-[var(--surface-wash)] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--field-focus-ring)] focus-visible:ring-inset motion-reduce:transition-none sm:grid-cols-[2.25rem_minmax(0,1fr)_auto] sm:items-center"
      data-sponsor-contact-kind={kind}
      href={href}
      rel={isExternal ? 'noreferrer' : undefined}
      target={isExternal ? '_blank' : undefined}
    >
      <span className="sponsor-contact-compact-icon">
        <Icon aria-hidden size={16} strokeWidth={1.8} />
      </span>
      <span className="sponsor-contact-compact-copy">
        <span className="sponsor-contact-compact-label">{label}</span>
        {children}
      </span>
      <span className="sponsor-contact-compact-action">
        {actionLabel}
        <ArrowUpRight className="transition-transform duration-[var(--motion-duration-base)] ease-[var(--motion-ease-move)] group-hover:translate-x-1 motion-reduce:transition-none" size={16} strokeWidth={1.8} />
      </span>
    </a>
  );
}

const linkMeta: Record<
  GeneralSponsorLinkKind,
  {
    actionLabel: string;
    icon?: typeof Globe2;
    label: string;
    valueLabel: string;
  }
> = {
  email: {
    actionLabel: 'Написать',
    icon: Mail,
    label: 'Email',
    valueLabel: 'Почта команды бренда'
  },
  instagram: {
    actionLabel: 'Перейти',
    icon: AtSign,
    label: 'Instagram',
    valueLabel: 'Профиль бренда'
  },
  telegram: {
    actionLabel: 'Написать',
    icon: Send,
    label: 'Telegram',
    valueLabel: 'Канал связи'
  },
  website: {
    actionLabel: 'Открыть',
    icon: Globe2,
    label: 'Сайт',
    valueLabel: 'Официальная страница'
  },
  whatsapp: {
    actionLabel: 'Написать',
    icon: MessageCircle,
    label: 'WhatsApp',
    valueLabel: 'Сообщение в WhatsApp'
  }
};

function SponsorContactLink({ link }: { link: GeneralSponsor['links'][number] }) {
  const meta = linkMeta[link.kind];
  const Icon = meta.icon ?? Globe2;

  return (
    <SponsorContactCompactLink
      actionLabel={meta.actionLabel}
      href={link.href}
      icon={Icon}
      kind={link.kind}
      label={meta.label}
    >
      <span className="sponsor-contact-compact-value">{meta.valueLabel}</span>
    </SponsorContactCompactLink>
  );
}

function SponsorPhoneLink({ contact }: { contact: GeneralSponsor['contacts'][number] }) {
  return (
    <SponsorContactCompactLink
      actionLabel="Позвонить"
      href={contact.href}
      icon={Phone}
      kind="phone"
      label={contact.name}
    >
      <span className="sponsor-contact-compact-value sponsor-contact-compact-phone" data-sponsor-phone-number>
        {contact.phone}
      </span>
    </SponsorContactCompactLink>
  );
}

function SponsorLogoMark({ priority = false, sponsor }: GeneralSponsorCardProps) {
  if (sponsor.logoSrc) {
    return (
      <Image
        alt={sponsor.logoAlt}
        className="general-sponsor-logo-image h-auto w-full max-w-[240px] object-contain md:max-w-[340px]"
        height={1252}
        priority={priority}
        sizes="(min-width: 1024px) 24rem, 82vw"
        src={sponsor.logoSrc}
        width={1252}
      />
    );
  }

  return (
    <div
      className="general-sponsor-logo-fallback grid min-h-32 w-full place-items-center rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--surface-wash)] px-4 py-6 text-center"
      data-logo-fallback="sponsor"
    >
      <span className="grid gap-2">
        <span className="text-[10px] font-semibold uppercase tracking-[var(--tracking-eyebrow-md)] text-[var(--muted)]">Генеральный спонсор</span>
        <span className="text-base font-semibold leading-6 text-[var(--text)] md:text-lg">Без логотипа</span>
        <span className="general-sponsor-status-label text-[11px] font-semibold uppercase tracking-[var(--tracking-marker)]">{sponsor.status}</span>
      </span>
    </div>
  );
}

export function GeneralSponsorCard({ priority = false, sponsor, variant = 'full' }: GeneralSponsorCardProps) {
  const venueItems = sponsor.venueValue.length > 0 ? sponsor.venueValue : [sponsor.shortDescription];
  const sponsorChips = Array.from(new Set([sponsor.name, ...sponsor.brands, ...sponsor.supplyGroups].filter(Boolean))).slice(0, 5);
  const visualState = sponsorVisualState(sponsor.status);

  if (variant === 'home') {
    return (
      <Panel className="home-sponsor-card general-sponsor-card" data-sponsor-state={visualState} data-sponsor-variant="home" padding="none">
        <div className="home-sponsor-card-grid">
          <div className="home-sponsor-media-box">
            <SponsorLogoMark priority={priority} sponsor={sponsor} />
          </div>

          <div className="home-sponsor-content">
            <div className="flex flex-wrap gap-2">
              <span className="home-sponsor-badge">{sponsor.status}</span>
            </div>
            <h3 className={`${displayFont.className} home-sponsor-title`}>{sponsor.name}</h3>
            <p className="home-sponsor-description">{sponsor.description}</p>

            <ul className="home-sponsor-benefits">
              {venueItems.slice(0, 3).map((item) => (
                <li key={item}>
                  <span aria-hidden="true" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>

            {sponsorChips.length > 0 ? (
              <div className="home-sponsor-chips">
                {sponsorChips.map((item) => (
                  <span key={item}>{item}</span>
                ))}
              </div>
            ) : null}

            <div className="home-sponsor-actions">
              <Button className="home-sponsor-primary-action" href="/general-sponsors" size="sm">
                Подробнее о спонсоре
                <ArrowUpRight size={16} strokeWidth={1.8} />
              </Button>
              <Button className="home-sponsor-secondary-action" href="/contacts?topic=sponsorship#contact-form" size="sm" variant="secondary">
                Связаться
                <ArrowUpRight size={16} strokeWidth={1.8} />
              </Button>
            </div>
          </div>
        </div>
      </Panel>
    );
  }

  return (
    <Panel
      className="general-sponsor-card overflow-hidden border-[var(--border-default)] bg-[var(--surface-elevated)] shadow-[var(--shadow-panel)]"
      data-sponsor-state={visualState}
      data-sponsor-variant="full"
      id={sponsorAnchorId(sponsor.slug)}
      padding="none"
    >
      <div className="general-sponsor-layout grid gap-0 lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)]">
        <div className="general-sponsor-media-column flex flex-col justify-between gap-5 border-b border-[var(--line)] p-4 md:gap-8 md:p-8 lg:border-b-0 lg:border-r">
          <div>
            <PublicEyebrow>Генеральный спонсор</PublicEyebrow>
            <div className="general-sponsor-logo-panel mt-4 md:mt-7">
              <SponsorLogoMark priority={priority} sponsor={sponsor} />
              {sponsor.brandLogos.length > 0 ? (
                <div className="mt-4 grid gap-3 border-t border-[var(--line)] pt-4 md:mt-5 md:pt-5">
                  {sponsor.brandLogos.map((logo) => (
                    <Image
                      alt={logo.alt}
                      className="general-sponsor-brand-logo-image h-auto w-full max-w-[240px] rounded-[var(--radius-sm)] object-contain md:max-w-[300px]"
                      height={440}
                      key={logo.src}
                      sizes="(min-width: 1024px) 20rem, 74vw"
                      src={logo.src}
                      width={1010}
                    />
                  ))}
                </div>
              ) : null}
            </div>
          </div>

          <div>
            <p className="general-sponsor-status-label text-[10px] font-semibold uppercase tracking-[var(--tracking-eyebrow-md)]">{sponsor.status}</p>
            <p className="mt-2 text-[13px] leading-[1.55] text-[var(--muted)]">{sponsor.shortDescription}</p>
            {sponsor.brands.length > 0 ? (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {sponsor.brands.slice(0, 5).map((brand) => (
                  <span
                    className="rounded-full border border-[var(--line)] px-2.5 py-0.5 text-[11px] font-medium text-[var(--muted)]"
                    key={brand}
                  >
                    {brand}
                  </span>
                ))}
              </div>
            ) : null}
          </div>
        </div>

        <div className="general-sponsor-content-column min-w-0 p-4 md:p-8">
          <PublicEyebrow tone="muted">{sponsor.title}</PublicEyebrow>

          <h3 className={`${displayFont.className} general-sponsor-name mt-4 text-[2rem] font-semibold leading-none text-[var(--text)] md:mt-5 md:text-[3.7rem]`}>
            {sponsor.name}
          </h3>
          <PublicBodyText className="general-sponsor-description-text mt-3 max-w-3xl md:mt-5" size="md">
            {sponsor.description}
          </PublicBodyText>

          <div className="mt-5 grid gap-5 border-y border-[var(--line)] py-4 md:mt-7 lg:grid-cols-[minmax(0,0.88fr)_minmax(0,1fr)]">
            <section>
              <p className="text-[11px] font-semibold uppercase tracking-[var(--tracking-eyebrow-md)] text-[var(--muted)]">Чем полезны заведению</p>
              <ul className="mt-3 grid gap-2 md:mt-4 md:gap-3">
                {venueItems.map((item) => (
                  <li className="grid grid-cols-[0.7rem_minmax(0,1fr)] gap-3 text-sm leading-6 text-[var(--text)]" key={item}>
                    <span className="mt-[0.62rem] h-1.5 w-1.5 rounded-full bg-[var(--accent)]" aria-hidden="true" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </section>
            <section className="border-t border-[var(--line)] pt-4 lg:border-t-0 lg:border-l lg:pl-5 lg:pt-0">
              <p className="text-[11px] font-semibold uppercase tracking-[var(--tracking-eyebrow-md)] text-[var(--muted)]">Продукты и бренды</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {[...sponsor.supplyGroups, ...sponsor.brands].slice(0, 10).map((item, index) => (
                  <span
                    className="general-sponsor-chip rounded-[var(--radius-sm)] border border-[var(--border-default)] bg-transparent px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[var(--tracking-eyebrow-sm)] text-[var(--text)]"
                    key={`${item}-${index}`}
                  >
                    {item}
                  </span>
                ))}
              </div>
            </section>
          </div>

          {sponsor.contacts.length > 0 || sponsor.links.length > 0 ? (
            <section className="mt-5 max-w-3xl">
              <div className="sponsor-contact-compact-list rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--surface-wash)] px-4 py-3 md:px-5">
                <p className="text-[13px] font-semibold leading-5 text-[var(--text)]">Связаться со спонсором</p>
                <p className="mt-1 text-[12px] leading-[1.5] text-[var(--muted)]">Поставки, условия сотрудничества и подбор продуктов под формат заведения.</p>
                <div className="mt-3">
                  {sponsor.contacts.map((contact) => (
                    <SponsorPhoneLink contact={contact} key={contact.phone} />
                  ))}
                  {sponsor.links.map((link) => (
                    <SponsorContactLink key={`${link.kind}-${link.href}`} link={link} />
                  ))}
                </div>
              </div>
            </section>
          ) : null}

          <CardActionRow className="flex-col items-stretch sm:flex-row sm:items-center">
            <Button className="w-full sm:w-auto rounded-[var(--radius-md)] px-7" href="/general-sponsors">
              Смотреть условия партнёрства
            </Button>
          </CardActionRow>
        </div>
      </div>
    </Panel>
  );
}
