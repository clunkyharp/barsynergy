import Image from 'next/image';
import { CalendarDays, Mail, Phone, Star, Users } from 'lucide-react';
import { PublicBodyText, PublicEyebrow } from '@/components/public/public-primitives';
import { CardActionRow, FeatureItem, IconBadge } from '@/components/public/public-ui-adaptation';
import { Button } from '@/components/ui/button';
import { Panel } from '@/components/ui/panel';
import { displayFont } from '@/lib/fonts';
import type { GeneralSponsor } from '@/lib/public/general-sponsors';

type GeneralSponsorCardProps = {
  sponsor: GeneralSponsor;
};

export function GeneralSponsorCard({ sponsor }: GeneralSponsorCardProps) {
  const socialLinks = sponsor.links.filter((link) => ['Instagram', 'WhatsApp'].includes(link.label));

  return (
    <Panel
      className="general-sponsor-card overflow-hidden border-[rgba(191,168,143,0.48)] bg-[color-mix(in_oklab,var(--surface),white_22%)] shadow-[0_18px_46px_rgba(20,20,18,0.045)]"
      padding="none"
    >
      <div className="grid gap-0 lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)]">
        <div className="flex flex-col justify-between gap-8 border-b border-[rgba(191,168,143,0.42)] p-6 lg:border-b-0 lg:border-r md:p-8">
          <div>
            <PublicEyebrow>Генеральный спонсор</PublicEyebrow>
            <div className="general-sponsor-logo-panel mt-7">
              <Image
                alt={sponsor.logoAlt}
                className="general-sponsor-logo-image h-auto w-full max-w-[340px] object-contain"
                height={1252}
                priority={false}
                sizes="(min-width: 1024px) 24rem, 82vw"
                src={sponsor.logoSrc}
                width={1252}
              />
            </div>
          </div>

          <div>
            <p className={`${displayFont.className} max-w-lg text-[2rem] font-semibold leading-[1.05] text-[var(--text)] md:text-[2.55rem]`}>
              {sponsor.title}
            </p>
          </div>
        </div>

        <div className="p-6 md:p-8">
          <div className="flex flex-wrap items-center gap-3">
            <IconBadge icon={Star} size="sm" tone="accent" />
            <PublicEyebrow tone="muted">Главный партнёр сезона</PublicEyebrow>
          </div>

          <h3 className={`${displayFont.className} mt-5 text-[2.6rem] font-semibold leading-none text-[var(--text)] md:text-[3.7rem]`}>
            {sponsor.name}
          </h3>
          <PublicBodyText className="mt-5 max-w-3xl" size="md">
            {sponsor.description}
          </PublicBodyText>

          <div className="mt-7 divide-y divide-[var(--line)] border-y border-[var(--line)]">
            <FeatureItem className="py-4" icon={Star} title="Генеральный спонсор BARSYNERGY" />
            <FeatureItem className="py-4" icon={CalendarDays} title="Участие в главных событиях и материалах" />
            <FeatureItem className="py-4" icon={Mail} title="Прямые контакты для рабочих запросов" />
            <FeatureItem className="py-4" icon={Users} title="Поддержка барного сообщества" />
          </div>

          <div className="mt-6 grid gap-3 md:grid-cols-2">
            {sponsor.contacts.map((contact) => (
              <div
                className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-3 rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--surface-wash)] p-3"
                key={contact.phone}
              >
                <IconBadge icon={Phone} size="sm" tone="soft" />
                <span className="min-w-0">
                  <span className="block text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">
                    {contact.name}
                  </span>
                  <a
                    className="mt-1 block w-fit select-all rounded-[var(--radius-sm)] text-sm font-semibold text-[var(--text)] transition hover:text-[var(--accent)] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--accent)]"
                    href={contact.href}
                  >
                    {contact.phone}
                  </a>
                </span>
              </div>
            ))}
            {socialLinks.map((link) => {
              const isInstagram = link.label === 'Instagram';

              return (
                <a
                  className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-3 rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--surface-wash)] p-3 transition hover:border-[var(--accent)]/35 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--accent)]"
                  href={link.href}
                  key={link.href}
                  rel="noreferrer"
                  target="_blank"
                >
                  <span
                    className={
                      isInstagram
                        ? 'grid h-9 w-9 place-items-center rounded-full bg-[linear-gradient(135deg,#feda75_0%,#d62976_45%,#4f5bd5_100%)] p-2'
                        : 'grid h-9 w-9 place-items-center rounded-full bg-[#238c46] p-2'
                    }
                  >
                    <Image
                      alt=""
                      className="h-full w-full object-contain"
                      height={24}
                      src={isInstagram ? '/images/social/instagram-logo.png' : '/images/social/whatsapp-logo.png'}
                      width={24}
                    />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">
                      Соцсеть
                    </span>
                    <span className="mt-1 block text-sm font-semibold text-[var(--text)] transition hover:text-[var(--accent)]">
                      {link.label}
                    </span>
                  </span>
                </a>
              );
            })}
          </div>

          <CardActionRow>
            <Button className="rounded-[var(--radius-md)] px-7" href="/general-sponsors">
              Подробнее
            </Button>
          </CardActionRow>
        </div>
      </div>
    </Panel>
  );
}
