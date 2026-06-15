import type { PublicMasterDetail } from '@/lib/public/content';
import { PageHero } from '@/components/public/page-hero';
import { Panel } from '@/components/ui/panel';
import { AppLink } from '@/components/ui/app-link';
import { displayFont } from '@/lib/fonts';
import { cn } from '@/lib/utils';
import { BadgeCheck, MapPin, Phone, Send, Mail, Star } from 'lucide-react';

export function MasterDetailView({ master }: { master: PublicMasterDetail }) {
  return (
    <>
      <PageHero
        title={master.title}
        subtitle={master.summary}
        tone="graphite"
      />

      <section className="public-section">
        <div className="public-section-inner">
          <div className="mx-auto max-w-3xl">
            <div className="flex flex-col gap-8">
              {master.imageUrl && (
                <div className="flex justify-center">
                  <div className="size-32 overflow-hidden rounded-full border-2 border-[var(--border-default)]">
                    <img
                      alt={master.title}
                      className="size-full object-cover"
                      src={master.imageUrl.src}
                    />
                  </div>
                </div>
              )}

              <div className="flex flex-wrap justify-center gap-4 text-sm">
                {master.cityName && (
                  <span className="inline-flex items-center gap-1.5 text-[var(--muted)]">
                    <MapPin size={14} />
                    {master.cityName}
                  </span>
                )}
                {master.isVerified && (
                  <span className="inline-flex items-center gap-1.5 text-[var(--accent-strong)]">
                    <BadgeCheck size={14} />
                    Проверено BARSYNERGY
                  </span>
                )}
                {master.experienceYears != null && (
                  <span className="inline-flex items-center gap-1.5 text-[var(--muted)]">
                    <Star size={14} />
                    {master.experienceYears} лет опыта
                  </span>
                )}
              </div>

              {master.specializations.length > 0 && (
                <div>
                  <h2 className={cn(displayFont.className, 'mb-3 text-lg font-semibold')}>Специализация</h2>
                  <div className="flex flex-wrap gap-2">
                    {master.specializations.map((spec) => (
                      <span
                        key={spec}
                        className="rounded-[var(--radius-pill)] border border-[var(--border-default)] bg-[var(--surface-wash)] px-3 py-1 text-sm"
                      >
                        {spec}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {master.rateLabel && (
                <Panel tone="elevated">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-[var(--muted)]">Стоимость услуг</span>
                    <span className={cn(displayFont.className, 'text-xl font-semibold text-[var(--accent-strong)]')}>{master.rateLabel}</span>
                  </div>
                </Panel>
              )}

              {master.body && (
                <Panel tone="elevated">
                  <div className="prose-sm prose max-w-none">
                    <p className="text-sm leading-6 text-[var(--editorial-dark-muted)] whitespace-pre-line">{master.body}</p>
                  </div>
                </Panel>
              )}

              {master.serviceArea && (
                <div>
                  <h2 className={cn(displayFont.className, 'mb-2 text-lg font-semibold')}>География</h2>
                  <p className="text-sm text-[var(--editorial-dark-muted)]">{master.serviceArea}</p>
                </div>
              )}

              {(master.contactTelegram || master.contactPhone || master.contactEmail) && (
                <Panel tone="elevated">
                  <h2 className={cn(displayFont.className, 'mb-3 text-lg font-semibold')}>Контакты</h2>
                  <div className="flex flex-col gap-3 text-sm">
                    {master.contactTelegram && (
                      <AppLink className="inline-flex items-center gap-2 text-[var(--accent)] hover:underline" href={`https://t.me/${master.contactTelegram.replace(/^@/, '')}`}>
                        <Send size={14} />
                        {master.contactTelegram}
                      </AppLink>
                    )}
                    {master.contactPhone && (
                      <AppLink className="inline-flex items-center gap-2 text-[var(--accent)] hover:underline" href={`tel:${master.contactPhone}`}>
                        <Phone size={14} />
                        {master.contactPhone}
                      </AppLink>
                    )}
                    {master.contactEmail && (
                      <AppLink className="inline-flex items-center gap-2 text-[var(--accent)] hover:underline" href={`mailto:${master.contactEmail}`}>
                        <Mail size={14} />
                        {master.contactEmail}
                      </AppLink>
                    )}
                  </div>
                </Panel>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
