import Image from 'next/image';
import type { CSSProperties } from 'react';
import { ArrowUpRight, Globe2, Mail, Phone, Send } from 'lucide-react';
import { PublicBodyText, PublicEyebrow } from '@/components/public/public-primitives';
import { CardActionRow } from '@/components/public/public-ui-adaptation';
import { Button } from '@/components/ui/button';
import { Panel } from '@/components/ui/panel';
import { displayFont } from '@/lib/fonts';
import type { GeneralSponsor, GeneralSponsorLinkKind } from '@/lib/public/general-sponsors';

type GeneralSponsorCardProps = {
  priority?: boolean;
  sponsor: GeneralSponsor;
};

function SponsorPhoneCard({ contact }: { contact: GeneralSponsor['contacts'][number] }) {
  return (
    <a
      aria-label={`Открыть WhatsApp: ${contact.name}, ${contact.phone}`}
      className="group grid min-h-[5.5rem] grid-cols-[auto_minmax(0,1fr)] gap-3 rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--surface-wash)] p-3 transition hover:border-[var(--accent)]/32 hover:bg-[var(--surface-wash-strong)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] sm:grid-cols-[auto_minmax(0,1fr)_auto] sm:items-center sm:p-4"
      href={contact.href}
      rel="noreferrer"
      target="_blank"
    >
      <span className="grid size-10 shrink-0 place-items-center rounded-[var(--radius-sm)] border border-[var(--accent)]/24 bg-[var(--accent-soft)] text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--accent)]">
        <Phone aria-hidden size={17} strokeWidth={1.8} />
      </span>
      <span className="min-w-0">
        <span className="block text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">Телефон</span>
        <span className="mt-1 block text-sm font-semibold leading-5 text-[var(--text)]">{contact.name}</span>
        <span
          className="mt-1 block whitespace-nowrap text-sm leading-5 text-[var(--text)] sm:text-[0.9375rem] md:text-base"
          data-sponsor-phone-number
        >
          {contact.phone}
        </span>
      </span>
      <span className="col-span-2 inline-flex w-fit items-center gap-2 whitespace-nowrap text-sm font-semibold text-[var(--accent)] sm:col-span-1 sm:justify-self-end">
        WhatsApp
        <ArrowUpRight className="transition-transform group-hover:translate-x-1" size={16} strokeWidth={1.8} />
      </span>
    </a>
  );
}

const linkMeta: Record<
  GeneralSponsorLinkKind,
  {
    actionLabel: string;
    accent: string;
    icon?: typeof Globe2;
    iconSrc?: string;
  }
> = {
  email: {
    accent: '#8f3d32',
    actionLabel: 'Написать',
    icon: Mail
  },
  instagram: {
    accent: '#c14f7a',
    actionLabel: 'Открыть Instagram',
    iconSrc: '/images/social/instagram-logo.png'
  },
  telegram: {
    accent: '#2a86d9',
    actionLabel: 'Открыть Telegram',
    icon: Send
  },
  website: {
    accent: '#5f4a3d',
    actionLabel: 'Открыть сайт',
    icon: Globe2
  },
  whatsapp: {
    accent: '#238c46',
    actionLabel: 'Открыть WhatsApp',
    iconSrc: '/images/social/whatsapp-logo.png'
  }
};

function SponsorChannelIcon({
  icon: Icon,
  iconSrc,
  label
}: {
  icon?: typeof Globe2;
  iconSrc?: string;
  label: string;
}) {
  return (
    <span className="grid size-12 shrink-0 place-items-center rounded-[var(--radius-sm)] border border-[color-mix(in_srgb,var(--sponsor-channel-accent)_24%,var(--border-default))] bg-[color-mix(in_srgb,var(--sponsor-channel-accent)_9%,var(--surface-wash))] p-2 text-[10px] font-semibold uppercase tracking-[0.08em] text-[var(--sponsor-channel-accent)] sm:size-20 sm:p-5">
      {iconSrc ? (
        <Image alt="" aria-hidden className="h-full w-full object-contain opacity-95" height={64} src={iconSrc} width={64} />
      ) : Icon ? (
        <Icon aria-hidden="true" size={22} strokeWidth={1.8} />
      ) : (
        label.slice(0, 2).toLocaleUpperCase('ru')
      )}
    </span>
  );
}

function SponsorContactLink({ link }: { link: GeneralSponsor['links'][number] }) {
  const meta = linkMeta[link.kind];
  const style = { '--sponsor-channel-accent': meta.accent } as CSSProperties;

  return (
    <a
      aria-label={meta.actionLabel}
      className="group flex min-h-[5.5rem] items-center justify-between gap-6 rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--surface-wash)] px-3 py-3 transition duration-200 hover:border-[color-mix(in_srgb,var(--sponsor-channel-accent)_34%,var(--border-default))] hover:bg-[var(--surface-wash-strong)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] sm:px-4 sm:py-4"
      data-sponsor-channel-card={link.kind}
      href={link.href}
      rel={link.href.startsWith('http') ? 'noreferrer' : undefined}
      style={style}
      target={link.href.startsWith('http') ? '_blank' : undefined}
    >
      <SponsorChannelIcon icon={meta.icon} iconSrc={meta.iconSrc} label={link.label} />
      <span
        className="inline-flex shrink-0 items-center gap-2 whitespace-nowrap text-[13px] font-semibold text-[var(--sponsor-channel-accent)] sm:text-sm"
        data-sponsor-channel-cta
      >
        {meta.actionLabel}
        <ArrowUpRight className="transition-transform group-hover:translate-x-1" size={16} strokeWidth={1.8} />
      </span>
    </a>
  );
}

export function GeneralSponsorCard({ priority = false, sponsor }: GeneralSponsorCardProps) {
  const venueItems = sponsor.venueValue.length > 0 ? sponsor.venueValue : [sponsor.shortDescription];

  return (
    <Panel
      className="general-sponsor-card overflow-hidden border-[var(--border-default)] bg-[var(--surface-elevated)] shadow-[var(--shadow-panel)]"
      padding="none"
    >
      <div className="grid gap-0 lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)]">
        <div className="flex flex-col justify-between gap-5 border-b border-[var(--line)] p-4 md:gap-8 md:p-8 lg:border-b-0 lg:border-r">
          <div>
            <PublicEyebrow>Генеральный спонсор</PublicEyebrow>
            <div className="general-sponsor-logo-panel mt-4 md:mt-7">
              {sponsor.logoSrc ? (
                <Image
                  alt={sponsor.logoAlt}
                  className="general-sponsor-logo-image h-auto w-full max-w-[240px] object-contain md:max-w-[340px]"
                  height={1252}
                  priority={priority}
                  sizes="(min-width: 1024px) 24rem, 82vw"
                  src={sponsor.logoSrc}
                  width={1252}
                />
              ) : (
                <div className="grid min-h-32 place-items-center text-3xl font-semibold uppercase tracking-[0.08em] text-[var(--text)]">
                  {sponsor.name.slice(0, 2)}
                </div>
              )}
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
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--accent)]">{sponsor.status}</p>
            <p className={`${displayFont.className} mt-3 max-w-lg text-[1.55rem] font-semibold leading-[1.05] text-[var(--text)] md:mt-4 md:text-[2.55rem]`}>
              {sponsor.shortDescription}
            </p>
          </div>
        </div>

        <div className="p-4 md:p-8">
          <PublicEyebrow tone="muted">{sponsor.title}</PublicEyebrow>

          <h3 className={`${displayFont.className} mt-4 text-[2rem] font-semibold leading-none text-[var(--text)] md:mt-5 md:text-[3.7rem]`}>
            {sponsor.name}
          </h3>
          <PublicBodyText className="mt-3 max-h-[5.25rem] max-w-3xl overflow-hidden md:mt-5 md:max-h-none" size="md">
            {sponsor.description}
          </PublicBodyText>

          <div className="mt-5 grid gap-5 border-y border-[var(--line)] py-4 md:mt-7 lg:grid-cols-[minmax(0,0.88fr)_minmax(0,1fr)]">
            <section>
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">Чем полезны заведению</p>
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
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">Продукты и бренды</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {[...sponsor.supplyGroups, ...sponsor.brands].slice(0, 10).map((item, index) => (
                  <span
                    className="rounded-[var(--radius-sm)] border border-[var(--border-default)] bg-transparent px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.1em] text-[var(--text)]"
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
              <div className="rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--surface-wash)] p-4 md:p-5">
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">Контакты спонсора</p>
                <div className="mt-4 grid gap-4">
                  {sponsor.contacts.length > 0 ? (
                    <div>
                      <div className="grid gap-2 sm:grid-cols-2">
                        {sponsor.contacts.map((contact) => (
                          <SponsorPhoneCard contact={contact} key={contact.phone} />
                        ))}
                      </div>
                    </div>
                  ) : null}

                  {sponsor.links.length > 0 ? (
                    <div>
                      <p className="text-sm font-semibold leading-5 text-[var(--text)]">Каналы связи</p>
                      <div className="mt-2 grid gap-2 xl:grid-cols-2">
                        {sponsor.links.map((link) => (
                          <SponsorContactLink key={`${link.kind}-${link.href}`} link={link} />
                        ))}
                      </div>
                    </div>
                  ) : null}
                </div>
              </div>
            </section>
          ) : null}

          <CardActionRow>
            <Button className="rounded-[var(--radius-md)] px-7" href="/general-sponsors">
              Смотреть спонсорство
            </Button>
          </CardActionRow>
        </div>
      </div>
    </Panel>
  );
}
