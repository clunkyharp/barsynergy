'use client';

import { useState } from 'react';
import Image from 'next/image';
import { ArrowUpRight, Check, Copy } from 'lucide-react';
import { displayFont } from '@/lib/fonts';
import { PublicBodyText, PublicEyebrow } from '@/components/public/public-primitives';
import { Button } from '@/components/ui/button';
import { MetaChip } from '@/components/ui/meta-chip';
import { Panel } from '@/components/ui/panel';
import { cn } from '@/lib/utils';
import type { GeneralSponsor } from '@/lib/public/general-sponsors';

type GeneralSponsorCardProps = {
  sponsor: GeneralSponsor;
};

const partnerPoints = [
  'Поставка под формат заведения',
  'Подбор кофе, какао и концентратов',
  'Быстрая связь по прайсу и заявкам'
];

export function GeneralSponsorCard({ sponsor }: GeneralSponsorCardProps) {
  const [copiedPhone, setCopiedPhone] = useState<string | null>(null);

  const heroChips = [
    'Кофе',
    'Какао',
    sponsor.brands.find((item) => item === 'KOF') ?? sponsor.brands[0],
    sponsor.brands.find((item) => item === 'Vérle') ?? sponsor.brands[1],
    sponsor.brands.find((item) => item === 'Happy Apple') ?? sponsor.brands[sponsor.brands.length - 1],
    'Поставки для HoReCa'
  ].filter(Boolean);

  async function handleCopy(phone: string) {
    try {
      await navigator.clipboard.writeText(phone);
      setCopiedPhone(phone);
      window.setTimeout(() => {
        setCopiedPhone((current) => (current === phone ? null : current));
      }, 1800);
    } catch {
      setCopiedPhone(null);
    }
  }

  return (
    <Panel
      className="overflow-hidden border-[rgba(191,168,143,0.34)] bg-[color-mix(in_oklab,var(--surface),white_18%)]"
      padding="lg"
    >
      <div className="rounded-[30px] border border-[rgba(191,168,143,0.3)] bg-[linear-gradient(180deg,rgba(255,250,244,0.88),rgba(247,240,232,0.98))]">
        <div className="px-5 py-5 md:px-6 md:py-6 xl:px-7 xl:py-7">
          <div className="flex flex-col gap-4 border-b border-black/10 pb-5 md:flex-row md:items-start md:justify-between">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2.5">
                <PublicEyebrow>Генеральный спонсор</PublicEyebrow>
                <MetaChip className="border-[rgba(153,44,38,0.16)] bg-white/78 px-3 py-1.5 text-[10px] tracking-[0.14em] text-[var(--accent)]">
                  {sponsor.title}
                </MetaChip>
              </div>

              <h3
                className={`${displayFont.className} display-tight mt-5 text-[clamp(2.5rem,6vw,4.8rem)] uppercase leading-[0.88] tracking-[-0.03em] text-[var(--text)]`}
              >
                {sponsor.name}
              </h3>
              <p className="mt-4 max-w-3xl text-base leading-8 text-[var(--text)]/78 md:text-[17px]">{sponsor.shortDescription}</p>
            </div>

            <div className="flex flex-wrap gap-2 md:max-w-[18rem] md:justify-end">
              {heroChips.map((item) => (
                <MetaChip
                  className="border-[rgba(191,168,143,0.45)] bg-white/66 px-2.5 py-1 text-[10px] tracking-[0.14em] text-[var(--text)]"
                  key={item}
                >
                  {item}
                </MetaChip>
              ))}
            </div>
          </div>

          <div className="grid gap-5 pt-5 xl:grid-cols-[minmax(0,0.6fr)_minmax(280px,0.4fr)] xl:items-start">
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--accent)]">Что закрывает партнёр</p>
              <div className="mt-4 rounded-[24px] border border-black/10 bg-white/48">
                {partnerPoints.map((item, index) => (
                  <div
                    className={cn(
                      'grid gap-3 px-4 py-4 first:rounded-t-[24px] last:rounded-b-[24px] md:grid-cols-[42px_minmax(0,1fr)] md:px-5',
                      index < partnerPoints.length - 1 && 'border-b border-black/10'
                    )}
                    key={item}
                  >
                    <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--accent)]">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <p className="text-sm font-semibold uppercase leading-6 text-[var(--text)] md:text-[15px]">{item}</p>
                  </div>
                ))}
              </div>

              <PublicBodyText className="mt-4 max-w-2xl">
                {sponsor.description}
              </PublicBodyText>
            </div>

            <div className="rounded-[26px] border border-black/10 bg-[color-mix(in_oklab,var(--surface),white_24%)] p-4 md:p-5">
              <div className="rounded-[22px] border border-black/10 bg-white/84 p-4">
                <div className="flex min-h-[180px] items-center justify-center rounded-[18px] border border-[rgba(191,168,143,0.32)] bg-[linear-gradient(180deg,rgba(255,252,248,0.98),rgba(244,235,225,0.98))] px-6 py-8 md:min-h-[210px]">
                  <Image
                    alt={sponsor.logoAlt}
                    className="h-auto w-full max-w-[220px] object-contain"
                    height={1252}
                    priority={false}
                    sizes="(min-width: 1280px) 240px, (min-width: 768px) 220px, 70vw"
                    src={sponsor.logoSrc}
                    width={1252}
                  />
                </div>

                <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--accent)]">
                  Ключевой партнёр по поставкам
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-black/10 px-5 py-5 md:px-6 md:py-6 xl:px-7 xl:py-6">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--accent)]">Контакты</p>
              <p className="mt-2 text-sm leading-6 text-[var(--muted)]">Быстрый выход на прайс, поставку и рабочие заявки.</p>
            </div>

            <div className="flex flex-wrap gap-2">
              {sponsor.links.map((link) => (
                <Button
                  className="rounded-full border-black/10 px-4 text-[var(--text)] hover:border-[var(--accent)] hover:text-[var(--accent)]"
                  href={link.href}
                  key={link.label}
                  rel="noreferrer"
                  size="sm"
                  target="_blank"
                  variant="ghost"
                >
                  {link.label}
                  <ArrowUpRight size={16} />
                </Button>
              ))}
            </div>
          </div>

          <div className="mt-5 grid gap-3">
            {sponsor.contacts.map((contact) => {
              const isCopied = copiedPhone === contact.phone;

              return (
                <div
                  className="flex flex-col gap-3 rounded-[20px] border border-black/10 bg-white/44 px-4 py-4 md:flex-row md:items-center md:justify-between"
                  key={contact.phone}
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                      <span className="text-sm font-semibold uppercase tracking-[0.08em] text-[var(--text)]">{contact.name}</span>
                      <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">
                        {contact.role ?? 'Контакт по поставкам'}
                      </span>
                    </div>
                    <p className="mt-2 select-text text-[18px] font-semibold leading-6 text-[var(--text)] md:text-[20px]">
                      {contact.phone}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Button className="rounded-full px-4" href={contact.href} size="sm" variant="secondary">
                      Позвонить
                    </Button>
                    <button
                      className={cn(
                        'inline-flex min-h-10 items-center justify-center gap-2 rounded-full border px-4 py-1.5 text-xs font-semibold tracking-[0.08em] text-[var(--text)] transition focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--accent)]',
                        isCopied ? 'border-[var(--accent)]/28 bg-[var(--accent)]/10 text-[var(--accent)]' : 'border-black/10 hover:border-[var(--accent)] hover:text-[var(--accent)]'
                      )}
                      onClick={() => handleCopy(contact.phone)}
                      type="button"
                    >
                      {isCopied ? <Check size={14} /> : <Copy size={14} />}
                      {isCopied ? 'Скопировано' : 'Скопировать'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </Panel>
  );
}
