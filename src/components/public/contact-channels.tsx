'use client';

import { type CSSProperties } from 'react';
import Image from 'next/image';
import { ArrowUpRight, Copy } from 'lucide-react';
import { getChannelAccentVar } from '@/components/public/channel-accent';
import { contactMethods, type ContactMethod } from '@/components/public/contact-application-form-constants';
import { useCopy } from '@/lib/hooks/use-copy';
import { displayFont } from '@/lib/fonts';

const channelBackgrounds = {
  telegram: '/images/social/generated/telegram-bg.png',
  whatsapp: '/images/social/generated/whatsapp-bg.png',
  instagram: '/images/social/generated/instagram-bg.png'
} as const;

function ChannelCard({ method }: { method: ContactMethod }) {
  const { copy } = useCopy();
  const bgSrc = method.tone in channelBackgrounds ? channelBackgrounds[method.tone as keyof typeof channelBackgrounds] : null;
  const accent = getChannelAccentVar(method.tone);
  const style = { '--channel-accent': accent } as CSSProperties;

  return (
    <div className="group relative" style={style}>
      <div className="relative flex h-full w-full flex-col overflow-hidden rounded-[var(--radius-lg)] border border-[color-mix(in_srgb,var(--accent)_18%,transparent)] bg-[var(--editorial-dark-surface)] p-5 text-left text-[var(--editorial-dark-text)] transition-[border-color,box-shadow] duration-[var(--motion-duration-base)] ease-[var(--motion-ease-standard)] group-hover:border-[color-mix(in_srgb,var(--accent)_55%,transparent)] group-hover:shadow-[0_8px_32px_rgba(0,0,0,0.3)] motion-reduce:transition-none md:p-6">
        {bgSrc ? (
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <Image
              alt=""
              className="object-cover opacity-40 brightness-[0.6] saturate-[0.5]"
              fill
              sizes="(min-width: 1024px) 24rem, (min-width: 640px) 50vw, 100vw"
              src={bgSrc}
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[var(--editorial-dark-surface)] via-[var(--editorial-dark-surface)]/60 to-transparent" />
          </div>
        ) : null}

        <div className="relative min-w-0">
          <div className="min-w-0">
            <span className="block text-[10px] font-semibold uppercase tracking-[var(--tracking-eyebrow-md)] text-[color-mix(in_srgb,var(--editorial-dark-text)_50%,transparent)]">
              {method.name}
            </span>
            <span className="mt-1 flex min-w-0 flex-wrap items-center gap-2">
              <span className="break-all text-sm font-semibold leading-5 text-[var(--editorial-dark-text)]">
                {method.value}
              </span>
              <button
                aria-label={`Скопировать ${method.value}`}
                className="inline-grid size-7 shrink-0 place-items-center rounded-[var(--radius-sm)] border border-[color-mix(in_srgb,var(--editorial-dark-text)_18%,transparent)] bg-[color-mix(in_srgb,var(--editorial-dark-surface)_82%,transparent)] text-[color-mix(in_srgb,var(--editorial-dark-text)_55%,transparent)] transition-colors duration-150 ease-in-out hover:border-[color-mix(in_srgb,var(--channel-accent)_42%,transparent)] hover:text-[var(--editorial-dark-text)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
                onClick={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  void copy(method.value);
                }}
                type="button"
              >
                <Copy aria-hidden="true" size={13} strokeWidth={1.8} />
              </button>
            </span>
          </div>
        </div>

        {method.descriptor ? (
          <>
            <p className={`${displayFont.className} relative mt-5 text-[1.45rem] font-semibold leading-[1.15] text-[var(--editorial-dark-text)] md:text-[1.7rem]`}>
              {method.descriptor.split('.')[0]}.
            </p>
            <p className="relative mt-2 text-sm leading-6 text-[color-mix(in_srgb,var(--editorial-dark-text)_60%,transparent)]">
              {method.descriptor.split('.').slice(1).join('.').trim()}
            </p>
          </>
        ) : null}

        <div className="relative mt-5 flex items-center justify-between gap-3 border-t border-[color-mix(in_srgb,var(--editorial-dark-text)_15%,transparent)] pt-4">
          <span className="text-[11px] font-semibold uppercase tracking-[var(--tracking-eyebrow-sm)] text-[color-mix(in_srgb,var(--editorial-dark-text)_50%,transparent)]">
            {method.helper}
          </span>
          <a
            className="inline-flex items-center gap-2 rounded-[var(--radius-sm)] text-sm font-semibold text-[var(--channel-accent)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--accent)]"
            href={method.href}
            rel="noreferrer"
            target="_blank"
          >
            {method.actionLabel}
            <ArrowUpRight aria-hidden="true" className="transition-transform duration-[var(--motion-duration-base)] ease-[var(--motion-ease-move)] group-hover:translate-x-1 motion-reduce:transition-none" size={16} strokeWidth={1.8} />
          </a>
        </div>
      </div>

    </div>
  );
}

export function ContactChannels() {
  return (
    <section className="relative border-b border-[var(--line)] bg-[var(--editorial-dark-surface)] py-10 md:py-12" data-theme="dark">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_24%,rgba(255,255,255,0.04),transparent_22%),radial-gradient(circle_at_80%_18%,rgba(255,255,255,0.02),transparent_22%)]"
      />
      <div className="container relative">
        <div className="mx-auto max-w-5xl">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[var(--tracking-eyebrow-md)] text-[var(--accent)]">
                Прямой контакт
              </p>
              <h2 className={`${displayFont.className} mt-2 text-[1.7rem] font-semibold leading-[1.1] text-[var(--editorial-dark-text)] md:text-[2.1rem]`}>
                Где написать напрямую
              </h2>
            </div>
            <p className="max-w-md text-sm leading-6 text-[color-mix(in_srgb,var(--editorial-dark-text)_60%,transparent)]">
              Выберите канал — каждый удобен для своего типа задачи. Наведите на карточку, чтобы скопировать контакт.
            </p>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {contactMethods.map((method) => (
              <ChannelCard
                key={method.mark}
                method={method}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
