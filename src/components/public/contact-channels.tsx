import { SocialChannelCard } from '@/components/public/social-channel-card';
import { contactMethods } from '@/components/public/contact-application-form-constants';
import { displayFont } from '@/lib/fonts';

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
              Выберите канал — каждый удобен для своего типа задачи.
            </p>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {contactMethods.map((method) => (
              <SocialChannelCard
                actionLabel={method.actionLabel}
                description={method.descriptor}
                eyebrow={method.name}
                helper={method.helper}
                href={method.href}
                key={method.mark}
                mode="contact"
                value={method.value}
                variant={method.tone}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
