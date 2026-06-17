import type { PublicMasterDetail } from '@/lib/public/content';
import { Panel } from '@/components/ui/panel';
import { AppLink } from '@/components/ui/app-link';
import { displayFont } from '@/lib/fonts';
import { cn } from '@/lib/utils';
import { ArrowLeft, BadgeCheck, BriefcaseBusiness, Mail, MapPin, Phone, Send, ShieldCheck, Star } from 'lucide-react';

function serviceFacts(master: PublicMasterDetail) {
  return [
    master.experienceYears != null ? { label: 'Опыт работы', value: `${master.experienceYears} лет`, icon: Star } : undefined,
    master.cityName ? { label: 'Локация', value: master.cityName, icon: MapPin } : undefined,
    master.serviceArea ? { label: 'География', value: master.serviceArea, icon: BriefcaseBusiness } : undefined,
    master.isVerified ? { label: 'Статус', value: 'Проверено BARSYNERGY', icon: ShieldCheck } : undefined
  ].filter(Boolean) as Array<{ label: string; value: string; icon: typeof Star }>;
}

function telegramHref(value: string) {
  return `https://t.me/${value.replace(/^@/, '')}`;
}

export function MasterDetailView({ master }: { master: PublicMasterDetail }) {
  const facts = serviceFacts(master);
  const hasContacts = Boolean(master.contactTelegram || master.contactPhone || master.contactEmail);

  return (
    <>
      <section className="master-profile-hero background-zone background-zone-graphite border-b border-[var(--line)] py-7 md:py-10">
        <div className="container">
          <AppLink className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--muted)] transition-colors hover:text-[var(--accent)]" href="/vacancies?view=specialists">
            <ArrowLeft aria-hidden="true" size={16} strokeWidth={1.8} />
            К списку специалистов
          </AppLink>

          <div className="mt-6">
            <p className="text-xs font-semibold uppercase tracking-[var(--tracking-eyebrow-sm)] text-[var(--accent)]">Профиль специалиста</p>
            <h1 className={cn(displayFont.className, 'mt-3 max-w-4xl text-[clamp(2.3rem,5vw,4.75rem)] font-semibold leading-[0.96] tracking-normal text-[var(--text)]')}>
              {master.title}
            </h1>
            {master.summary ? (
              <p className="mt-4 max-w-3xl text-base leading-7 text-[var(--muted)] md:text-lg">
                {master.summary}
              </p>
            ) : null}
          </div>
        </div>
      </section>

      <section className="master-profile-section background-zone background-zone-graphite border-b border-[var(--line)] py-8 md:py-12">
        <div className="container">
          <div className="master-profile-grid">
            <div className="min-w-0 space-y-5">
              <Panel className="master-profile-summary" padding="none">
                <div className="master-profile-summary-main">
                  {master.imageUrl ? (
                    <div className="master-profile-avatar">
                    <img
                      alt={master.title}
                      className="size-full object-cover"
                      src={master.imageUrl.src}
                    />
                    </div>
                  ) : null}

                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      {master.label ? (
                        <span className="master-profile-pill">{master.label}</span>
                      ) : null}
                      {master.isVerified ? (
                        <span className="master-profile-pill master-profile-pill-success">
                          <BadgeCheck aria-hidden="true" size={14} strokeWidth={2} />
                          Проверено
                        </span>
                      ) : null}
                    </div>

                    {master.rateLabel ? (
                      <div className="mt-8">
                        <span className="text-sm leading-5 text-[var(--muted)]">Стоимость услуг</span>
                        <p className="mt-2 text-[2rem] font-semibold leading-none text-[var(--text)] md:text-[2.5rem]">
                          {master.rateLabel}
                        </p>
                      </div>
                    ) : null}

                    {facts.length > 0 ? (
                      <div className="master-profile-facts mt-8">
                        {facts.map((fact) => {
                          const Icon = fact.icon;
                          return (
                            <div className="master-profile-fact" key={fact.label}>
                              <span aria-hidden="true">
                                <Icon size={16} strokeWidth={1.8} />
                              </span>
                              <div>
                                <span>{fact.label}</span>
                                <strong>{fact.value}</strong>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : null}
                  </div>
                </div>
              </Panel>

              {master.specializations.length > 0 ? (
                <Panel className="master-profile-card">
                  <h2 className="master-profile-card-title">Ключевые навыки</h2>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {master.specializations.map((spec) => (
                      <span
                        key={spec}
                        className="master-profile-chip"
                      >
                        {spec}
                      </span>
                    ))}
                  </div>
                </Panel>
              ) : null}

              {master.body && (
                <Panel className="master-profile-card">
                  <h2 className="master-profile-card-title">О специалисте</h2>
                  <p className="mt-4 whitespace-pre-line text-sm leading-7 text-[var(--muted)]">{master.body}</p>
                </Panel>
              )}

              {master.serviceArea && (
                <Panel className="master-profile-card">
                  <h2 className="master-profile-card-title">Формат работы</h2>
                  <p className="mt-4 text-sm leading-7 text-[var(--muted)]">{master.serviceArea}</p>
                </Panel>
              )}
            </div>

            <aside className="master-profile-contact">
              <Panel className="master-profile-card master-profile-sticky-card">
                <h2 className="master-profile-card-title">Связаться</h2>
                {hasContacts ? (
                  <div className="mt-5 grid gap-3">
                    {master.contactTelegram ? (
                      <AppLink className="master-profile-contact-action master-profile-contact-action-primary" href={telegramHref(master.contactTelegram)}>
                        <Send aria-hidden="true" size={17} strokeWidth={1.8} />
                        Написать в Telegram
                      </AppLink>
                    ) : null}
                    {master.contactEmail ? (
                      <AppLink className="master-profile-contact-action" href={`mailto:${master.contactEmail}`}>
                        <Mail aria-hidden="true" size={17} strokeWidth={1.8} />
                        Написать на Email
                      </AppLink>
                    ) : null}
                    {master.contactPhone ? (
                      <AppLink className="master-profile-contact-action" href={`tel:${master.contactPhone}`}>
                        <Phone aria-hidden="true" size={17} strokeWidth={1.8} />
                        Позвонить
                      </AppLink>
                    ) : null}
                  </div>
                ) : (
                  <p className="mt-4 text-sm leading-6 text-[var(--muted)]">Контакты пока не указаны. Вернитесь в каталог и выберите другого специалиста.</p>
                )}

                {master.contactLabel ? (
                  <div className="mt-6 border-t border-[var(--line)] pt-5">
                    <span className="text-xs leading-4 text-[var(--muted)]">Предпочтительный способ связи</span>
                    <p className="mt-1 text-sm font-semibold leading-5 text-[var(--text)]">{master.contactLabel}</p>
                  </div>
                ) : null}
              </Panel>
            </aside>
            </div>
        </div>
      </section>
    </>
  );
}
