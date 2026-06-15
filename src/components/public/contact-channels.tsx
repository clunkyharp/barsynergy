'use client';

import { useState, type CSSProperties } from 'react';
import { ArrowUpRight, AtSign, Copy, Mail, MessageCircle, Send } from 'lucide-react';
import { getChannelAccentVar } from '@/components/public/channel-accent';
import { EmailActionDialog } from '@/components/public/email-action-dialog';
import { contactMethods, type ContactMethod } from '@/components/public/contact-application-form-constants';
import { useCopy } from '@/lib/hooks/use-copy';
import { displayFont } from '@/lib/fonts';

const toneIcons = {
  email: Mail,
  telegram: Send,
  whatsapp: MessageCircle,
  instagram: AtSign
} as const;

type ToneWithIcon = keyof typeof toneIcons;

function hasIconForTone(tone: ContactMethod['tone']): tone is ToneWithIcon {
  return tone in toneIcons;
}

function ChannelCard({ method, onEmailClick }: { method: ContactMethod; onEmailClick: () => void }) {
  const { copy } = useCopy();
  const Icon = hasIconForTone(method.tone) ? toneIcons[method.tone] : Mail;
  const accent = getChannelAccentVar(method.tone);
  const style = { '--channel-accent': accent } as CSSProperties;
  const isEmail = method.tone === 'email';

  const linkProps = isEmail
    ? { onClick: onEmailClick, type: 'button' as const, role: 'button' as const }
    : { href: method.href, target: '_blank' as const, rel: 'noreferrer' as const };

  const Wrapper: 'a' | 'button' = isEmail ? 'button' : 'a';

  return (
    <div className="group relative" style={style}>
      <Wrapper
        {...(linkProps as Record<string, unknown>)}
        className="relative flex h-full w-full flex-col overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--surface-wash)] p-5 text-left transition-[background-color,border-color,box-shadow] duration-[var(--motion-duration-base)] ease-[var(--motion-ease-standard)] hover:border-[color-mix(in_srgb,var(--channel-accent)_38%,var(--border-default))] hover:bg-[var(--surface-wash-strong)] hover:shadow-[var(--shadow-card)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] motion-reduce:transition-none md:p-6"
      >
        <span aria-hidden="true" className="absolute inset-x-0 top-0 h-1 bg-[var(--channel-accent)]" />

        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <span className="block text-[10px] font-semibold uppercase tracking-[var(--tracking-eyebrow-md)] text-[var(--muted)]">
              {method.name}
            </span>
            <span className="mt-1 block break-all text-sm font-semibold leading-5 text-[var(--text)]">
              {method.value}
            </span>
          </div>
          <span className="grid size-12 shrink-0 place-items-center rounded-[var(--radius-md)] border border-[color-mix(in_srgb,var(--channel-accent)_26%,var(--border-default))] bg-[color-mix(in_srgb,var(--channel-accent)_12%,var(--surface))] text-[var(--channel-accent)]">
            <Icon aria-hidden="true" size={20} strokeWidth={1.8} />
          </span>
        </div>

        <p className={`${displayFont.className} mt-5 text-[1.45rem] font-semibold leading-[1.15] text-[var(--text)] md:text-[1.7rem]`}>
          {method.descriptor.split('.')[0]}.
        </p>
        <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
          {method.descriptor.split('.').slice(1).join('.').trim()}
        </p>

        <div className="mt-5 flex items-center justify-between gap-3 border-t border-[var(--line)] pt-4">
          <span className="text-[11px] font-semibold uppercase tracking-[var(--tracking-eyebrow-sm)] text-[var(--muted)]">
            {method.helper}
          </span>
          <span className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--channel-accent)]">
            {method.actionLabel}
            <ArrowUpRight aria-hidden="true" className="transition-transform duration-[var(--motion-duration-base)] ease-[var(--motion-ease-move)] group-hover:translate-x-1 motion-reduce:transition-none" size={16} strokeWidth={1.8} />
          </span>
        </div>
      </Wrapper>

      <button
        aria-label={`Скопировать ${method.value}`}
        className="absolute right-3 top-3 z-[1] grid size-8 place-items-center rounded-[var(--radius-sm)] border border-[var(--border-default)] bg-[var(--surface)] text-[var(--muted)] opacity-0 transition-opacity duration-150 ease-in-out hover:text-[var(--text)] focus-visible:opacity-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)] group-hover:opacity-100"
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          void copy(method.value);
        }}
        type="button"
      >
        <Copy aria-hidden="true" size={14} strokeWidth={1.8} />
      </button>
    </div>
  );
}

export function ContactChannels() {
  const [emailDialogOpen, setEmailDialogOpen] = useState(false);

  return (
    <>
      <section className="relative border-b border-[var(--line)] bg-[var(--surface)] py-10 md:py-12">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_24%,var(--accent-soft),transparent_22%),radial-gradient(circle_at_80%_18%,var(--surface-muted),transparent_22%)]"
        />
        <div className="container relative">
          <div className="mx-auto max-w-5xl">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[var(--tracking-eyebrow-md)] text-[var(--accent)]">
                  Прямой контакт
                </p>
                <h2 className={`${displayFont.className} mt-2 text-[1.7rem] font-semibold leading-[1.1] text-[var(--text)] md:text-[2.1rem]`}>
                  Где написать напрямую
                </h2>
              </div>
              <p className="max-w-md text-sm leading-6 text-[var(--muted)]">
                Выберите канал — каждый удобен для своего типа задачи. Наведите на карточку, чтобы скопировать контакт.
              </p>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {contactMethods.map((method) => (
                <ChannelCard
                  key={method.mark}
                  method={method}
                  onEmailClick={() => setEmailDialogOpen(true)}
                />
              ))}
            </div>
          </div>
        </div>
      </section>
      <EmailActionDialog onOpenChange={setEmailDialogOpen} open={emailDialogOpen} />
    </>
  );
}
