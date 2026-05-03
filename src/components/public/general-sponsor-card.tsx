import Image from 'next/image';
import { ArrowUpRight, CalendarDays, Globe2, Mail, Star, Users } from 'lucide-react';
import { PublicBodyText, PublicEyebrow } from '@/components/public/public-primitives';
import { CardActionRow, FeatureItem, IconBadge } from '@/components/public/public-ui-adaptation';
import { Button } from '@/components/ui/button';
import { MetaChip } from '@/components/ui/meta-chip';
import { Panel } from '@/components/ui/panel';
import type { GeneralSponsor } from '@/lib/public/general-sponsors';

type GeneralSponsorCardProps = {
  sponsor: GeneralSponsor;
};

export function GeneralSponsorCard({ sponsor }: GeneralSponsorCardProps) {
  const primaryLink = sponsor.links[0];
  const secondaryLink = sponsor.links[1];

  return (
    <Panel
      className="overflow-hidden border-[rgba(191,168,143,0.48)] bg-[color-mix(in_oklab,var(--surface),white_22%)] shadow-[0_24px_70px_rgba(20,20,18,0.06)]"
      padding="none"
    >
      <div className="grid gap-0 lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)]">
        <div className="flex flex-col justify-between gap-8 border-b border-[rgba(191,168,143,0.42)] p-6 lg:border-b-0 lg:border-r md:p-8">
          <div>
            <PublicEyebrow>Генеральный спонсор</PublicEyebrow>
            <div className="mt-7 rounded-[24px] border border-black/10 bg-[rgba(255,252,248,0.82)] p-6">
              <Image
                alt={sponsor.logoAlt}
                className="mx-auto h-auto w-full max-w-[380px] object-contain"
                height={1252}
                priority={false}
                sizes="(min-width: 1024px) 24rem, 82vw"
                src={sponsor.logoSrc}
                width={1252}
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <MetaChip className="border-[var(--accent)]/28 bg-[var(--accent)]/7 text-[var(--accent)]">
              Сезон 2026
            </MetaChip>
            <MetaChip className="border-black/10 bg-transparent text-[var(--muted)]">{sponsor.title}</MetaChip>
          </div>
        </div>

        <div className="p-6 md:p-8">
          <div className="flex flex-wrap items-center gap-3">
            <IconBadge icon={Star} size="sm" tone="accent" />
            <PublicEyebrow tone="muted">Главный партнёр сезона</PublicEyebrow>
          </div>

          <h3 className="mt-5 text-[2.3rem] font-semibold uppercase leading-none text-[var(--text)] md:text-[3.25rem]">
            {sponsor.name}
          </h3>
          <PublicBodyText className="mt-5 max-w-3xl" size="md">
            {sponsor.description}
          </PublicBodyText>

          <div className="mt-7 divide-y divide-black/10 border-y border-black/10">
            <FeatureItem className="py-4" icon={Star} title="Генеральный спонсор BARSYNERGY" />
            <FeatureItem className="py-4" icon={CalendarDays} title="Присутствие в ключевых событиях и материалах" />
            <FeatureItem className="py-4" icon={Mail} title="Прямые контакты для рабочих запросов" />
            <FeatureItem className="py-4" icon={Users} title="Поддержка профессионального сообщества" />
          </div>

          <div className="mt-6 grid gap-3 md:grid-cols-2">
            {sponsor.contacts.map((contact) => (
              <a
                className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-3 rounded-[18px] border border-black/10 bg-[rgba(255,252,248,0.72)] p-3 transition hover:border-[var(--accent)]/28 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--accent)]"
                href={contact.href}
                key={contact.phone}
              >
                <IconBadge icon={Mail} size="sm" tone="soft" />
                <span className="min-w-0">
                  <span className="block text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">
                    {contact.name}
                  </span>
                  <span className="mt-1 block text-sm font-semibold text-[var(--text)]">{contact.phone}</span>
                </span>
              </a>
            ))}
          </div>

          <CardActionRow>
            <Button className="rounded-full px-7" href="/general-sponsors">
              Подробнее
            </Button>
            {primaryLink ? (
              <Button className="rounded-full px-7" href={primaryLink.href} rel="noreferrer" target="_blank" variant="secondary">
                {primaryLink.label}
                <Globe2 size={16} />
              </Button>
            ) : null}
            {secondaryLink ? (
              <Button className="rounded-full px-7" href={secondaryLink.href} rel="noreferrer" target="_blank" variant="ghost">
                {secondaryLink.label}
                <ArrowUpRight size={16} />
              </Button>
            ) : null}
          </CardActionRow>
        </div>
      </div>
    </Panel>
  );
}
