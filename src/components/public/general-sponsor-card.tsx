import Image from 'next/image';
import { ArrowUpRight } from 'lucide-react';
import { PublicBodyText, PublicEyebrow } from '@/components/public/public-primitives';
import { EditorialAction } from '@/components/ui/editorial-action';
import { MetaChip } from '@/components/ui/meta-chip';
import { Panel } from '@/components/ui/panel';
import type { GeneralSponsor } from '@/lib/public/general-sponsors';

type GeneralSponsorCardProps = {
  sponsor: GeneralSponsor;
};

export function GeneralSponsorCard({ sponsor }: GeneralSponsorCardProps) {
  return (
    <Panel
      className="overflow-hidden border-[rgba(191,168,143,0.34)] bg-[color-mix(in_oklab,var(--surface),white_18%)]"
      padding="lg"
    >
      <div className="grid gap-8 lg:grid-cols-[0.62fr_1.38fr] xl:grid-cols-[0.68fr_1.32fr]">
        <div className="flex flex-col justify-between gap-6 border-b border-[rgba(191,168,143,0.34)] pb-6 lg:border-b-0 lg:border-r lg:pb-0 lg:pr-6 xl:pr-8">
          <div>
            <PublicEyebrow>Генеральный спонсор</PublicEyebrow>
            <div className="mt-5 mx-auto w-full max-w-[420px] overflow-hidden rounded-[26px] border border-black/10">
              <Image
                alt={sponsor.logoAlt}
                className="h-auto w-full object-cover"
                height={1252}
                priority={false}
                sizes="(min-width: 1280px) 24rem, (min-width: 1024px) 20rem, 90vw"
                src={sponsor.logoSrc}
                width={1252}
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-4 sm:gap-5">
            {sponsor.links.map((link) => (
              <EditorialAction
                className="px-4 tracking-[0.12em] sm:px-5"
                href={link.href}
                key={link.label}
                rel="noreferrer"
                target="_blank"
              >
                {link.label}
                <ArrowUpRight size={16} />
              </EditorialAction>
            ))}
          </div>
        </div>

        <div>
          <MetaChip className="border-[var(--accent)]/28 px-3 py-1.5 text-[10px] tracking-[0.14em] text-[var(--text)]">
            {sponsor.title}
          </MetaChip>

          <h3 className="mt-5 text-[32px] font-semibold uppercase leading-[1] text-[var(--text)] md:text-[44px]">
            {sponsor.name}
          </h3>
          <PublicBodyText className="mt-5 max-w-3xl" size="md">
            {sponsor.description}
          </PublicBodyText>

          <div className="mt-7 grid gap-6 md:grid-cols-2">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--accent)]">Основные позиции</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {sponsor.supplyGroups.map((item) => (
                  <MetaChip
                    className="border-[rgba(191,168,143,0.48)] bg-transparent px-2.5 py-1 text-[10px] tracking-[0.14em] text-[var(--muted)]"
                    key={item}
                  >
                    {item}
                  </MetaChip>
                ))}
              </div>
            </div>

            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--accent)]">Бренды и линейки</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {sponsor.brands.map((brand) => (
                  <MetaChip
                    className="border-[rgba(191,168,143,0.48)] bg-transparent px-2.5 py-1 text-[10px] tracking-[0.14em] text-[var(--muted)]"
                    key={brand}
                  >
                    {brand}
                  </MetaChip>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-8 border-t border-black/10 pt-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--accent)]">Контакты для связи</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {sponsor.contacts.map((contact) => (
                <a
                  className="rounded-[20px] border border-black/10 bg-[color-mix(in_oklab,var(--surface),white_22%)] px-4 py-4 transition-colors duration-200 hover:border-[var(--accent)]/34 hover:bg-[color-mix(in_oklab,var(--surface),var(--accent)_4%)] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--accent)]"
                  href={contact.href}
                  key={contact.phone}
                >
                  <span className="block text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
                    {contact.name}
                  </span>
                  <span className="mt-2 block text-lg font-semibold text-[var(--text)]">{contact.phone}</span>
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Panel>
  );
}
