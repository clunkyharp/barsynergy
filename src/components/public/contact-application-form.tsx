'use client';

import { useActionState, useMemo, useState } from 'react';
import type { PublicApplicationResult } from '@/lib/applications/public-form-helpers';
import {
  HiddenUtmFields,
  HoneypotField,
  PublicFormShellFooter,
  PublicFormShellHeader,
  type PublicApplicationFormProps
} from '@/components/public/application-form-section';
import { Button } from '@/components/ui/button';
import { ConsentField } from '@/components/ui/consent-field';
import { EditorialShell } from '@/components/ui/editorial-shell';
import { FormField, FormSection } from '@/components/ui/form-field';
import { Input } from '@/components/ui/input';
import { InlineLink } from '@/components/ui/inline-link';
import { Select } from '@/components/ui/select';
import { SubmissionResultDialog } from '@/components/ui/submission-result-dialog';
import { SubmitButton } from '@/components/ui/submit-button';
import { Textarea } from '@/components/ui/textarea';
import { SUPPORT_EMAIL } from '@/lib/contact-info';
import {
  contactMethods,
  contactTopicOptions,
  getContactMessageHint,
  getContactMessageLabel,
  getContactMessagePlaceholder,
  getContactTopicDetailsHint,
  getContactTopicDetailsTitle,
  shouldShowContactTopicDetails,
  type ContactTopicValue
} from './contact-application-form-constants';

export { contactMethods, contactTopicOptions, type ContactTopicValue } from './contact-application-form-constants';

export function ContactApplicationForm({ enabled, utm, cities, defaultTopic, defaults = {}, action }: Omit<PublicApplicationFormProps, 'result'> & { action: (prevState: PublicApplicationResult | null, formData: FormData) => Promise<PublicApplicationResult> }) {
  const [result, formAction] = useActionState(action, null);
  const hasDefaultTopic = defaultTopic ? contactTopicOptions.some((option) => option.value === defaultTopic) : false;
  const initialTopic = hasDefaultTopic ? (defaultTopic as ContactTopicValue) : '';
  const [topic, setTopic] = useState<ContactTopicValue | ''>(initialTopic);
  const selectedTopic = useMemo(
    () => contactTopicOptions.find((option) => option.value === topic) ?? contactTopicOptions.at(-1)!,
    [topic]
  );
  const messageLabel = getContactMessageLabel(topic);
  const messagePlaceholder = getContactMessagePlaceholder(topic);
  const messageHint = getContactMessageHint(topic);
  const showTopicDetails = shouldShowContactTopicDetails(topic);
  const topicDetailsTitle = getContactTopicDetailsTitle(topic);
  const topicDetailsHint = getContactTopicDetailsHint(topic);

  const form = enabled ? (
    <form action={formAction} className="editorial-form-shell public-form-shell">
      <HiddenUtmFields utm={utm} />
      <HoneypotField id="contact-message-website" />
      <PublicFormShellHeader
        eyebrow="Сообщение"
        title="Опишите задачу — ответим на ваш контакт"
        description="Укажите контакт и коротко опишите задачу. Детали можно добавить ниже, если они нужны."
        headingLevel="h2"
      />
      <div className="relative p-5 md:p-6">
        <div className="grid gap-6">
          <FormSection title="Основное">
            <div className="contact-primary-fields grid gap-4 md:grid-cols-2">
              <FormField htmlFor="contactName" label="Имя">
                <Input autoComplete="name" id="contactName" name="name" placeholder="Иван" required maxLength={160} minLength={2} />
              </FormField>
              <FormField
                htmlFor="contactValue"
                hint="Email, телефон или Telegram в одном поле."
                label="Контакт"
              >
                <Input autoComplete="on" id="contactValue" name="contact" placeholder="name@example.com или @username" required maxLength={180} />
              </FormField>
            </div>
          </FormSection>

          <FormSection title="Тема">
            <div className="grid gap-4 md:grid-cols-2">
              <FormField htmlFor="contactTopic" label="Тема">
                <Select id="contactTopic" name="topic" onChange={(event) => setTopic(event.target.value as ContactTopicValue)} defaultValue={initialTopic}>
                  <option value="" disabled>Выберите тему…</option>
                  {contactTopicOptions.map((topic) => (
                    <option key={topic.value} value={topic.value}>
                      {topic.label}
                    </option>
                  ))}
                </Select>
              </FormField>
              <FormField htmlFor="contactCityId" label="Город (необязательно)">
                <Select id="contactCityId" name="cityId" defaultValue="">
                  <option value="" disabled>Любой город</option>
                  {cities.map((city) => (
                    <option key={city.id} value={city.id}>
                      {city.name}
                    </option>
                  ))}
                </Select>
              </FormField>
              <p className="form-inline-note md:col-span-2">{selectedTopic.description}</p>
            </div>
          </FormSection>

          {showTopicDetails ? (
            <FormSection title={topicDetailsTitle}>
              <div className="form-topic-details grid gap-4">
                <p className="form-inline-note">{topicDetailsHint}</p>
                <div className="form-topic-details-panel grid gap-4 md:grid-cols-2">
                  {(topic === 'partnership' ||
                    topic === 'sponsorship' ||
                    topic === 'consulting') ? (
                    <FormField htmlFor="contactCompanyName" label="Компания">
                      <Input autoComplete="organization" id="contactCompanyName" name="companyName" defaultValue={defaults.companyName} placeholder="Например, Coffee Point" maxLength={180} />
                    </FormField>
                  ) : null}

                  {topic === 'consulting' ? (
                    <FormField htmlFor="contactTopicTitle" label="Направление консультации">
                      <Input autoComplete="off" id="contactTopicTitle" name="topicTitle" defaultValue={defaults.topicTitle} placeholder="Например, запуск кофейни" maxLength={180} />
                    </FormField>
                  ) : null}

                  {(topic === 'partnership' || topic === 'sponsorship') ? (
                    <>
                      <FormField htmlFor="contactPartnerType" label="Формат">
                        <Input autoComplete="off" id="contactPartnerType" name="partnerType" defaultValue={defaults.partnerType} placeholder="Например, совместное событие" maxLength={160} />
                      </FormField>
                      <FormField htmlFor="contactWebsiteUrl" label="Сайт или соцсеть">
                        <Input autoComplete="url" id="contactWebsiteUrl" name="websiteUrl" defaultValue={defaults.websiteUrl} placeholder="https://example.ru" maxLength={500} type="url" />
                      </FormField>
                    </>
                  ) : null}
                  {topic === 'article-topic' ? (
                    <>
                      <FormField htmlFor="contactTopicTitle" label="Тема или герой">
                        <Input autoComplete="off" id="contactTopicTitle" name="topicTitle" defaultValue={defaults.topicTitle} placeholder="Например, история локального бара" maxLength={180} />
                      </FormField>
                      <FormField htmlFor="contactFormatLabel" label="Формат">
                        <Input autoComplete="off" id="contactFormatLabel" name="formatLabel" defaultValue={defaults.formatLabel} placeholder="Например, интервью" maxLength={120} />
                      </FormField>
                    </>
                  ) : null}
                </div>
              </div>
            </FormSection>
          ) : null}

          <FormSection title="Сообщение">
            <FormField
              htmlFor="contactMessage"
              hint={messageHint}
              label={messageLabel}
            >
              <Textarea id="contactMessage" name="message" required className="min-h-40" maxLength={4000} placeholder={messagePlaceholder} />
            </FormField>
          </FormSection>

          <ConsentField>
            Согласен с <InlineLink href="/legal/privacy">политикой обработки персональных данных</InlineLink> и даю{' '}
            <InlineLink href="/legal/personal-data-consent">согласие на обработку персональных данных</InlineLink>, чтобы мы могли ответить на сообщение.
          </ConsentField>
        </div>
        <PublicFormShellFooter note="Отвечаем в течение рабочего дня.">
          <SubmitButton className="min-h-12 rounded-[var(--radius-md)] px-6 tracking-normal sm:self-start">
            Отправить сообщение
          </SubmitButton>
        </PublicFormShellFooter>
        <SubmissionResultDialog
          result={result}
          errorTitle="Не удалось отправить сообщение"
        />
      </div>
    </form>
  ) : (
    <EditorialShell className="p-5 md:p-6">
      <h3 className="text-lg font-semibold leading-7">Форма сейчас закрыта</h3>
      <p className="mt-3 text-sm leading-7 text-[var(--muted)]">
        Если вопрос срочный, напишите на email команды.
      </p>
      <Button className="mt-6 rounded-[var(--radius-md)] sm:self-start" href={`mailto:${SUPPORT_EMAIL}`} size="lg" variant="secondary">
        Написать на почту
      </Button>
    </EditorialShell>
  );

  return (
    <section className="relative scroll-mt-36 overflow-visible border-b border-[var(--line)] bg-[var(--surface)] py-8 md:scroll-mt-44 md:py-10" id="applications">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_24%,var(--accent-soft),transparent_18%),radial-gradient(circle_at_78%_22%,var(--surface-muted),transparent_20%)]"
      />
      <div className="container relative">
        <article className="mx-auto grid max-w-3xl gap-5">
          <div className="min-w-0 scroll-mt-36 md:scroll-mt-44" id="contact-form">
            {form}
          </div>
          <div className="rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--surface-wash)] p-4 md:p-5">
            <p className="text-[11px] font-semibold uppercase tracking-[var(--tracking-eyebrow-md)] text-[var(--accent)]">Прямой контакт</p>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {contactMethods.map((method) => (
                <a
                  className="contact-method-link group grid grid-cols-[2.625rem_minmax(0,1fr)_auto] items-center gap-3 rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[color-mix(in_oklab,var(--surface)_82%,transparent)] p-3 text-left transition-colors duration-[var(--motion-duration-base)] ease-[var(--motion-ease-standard)] hover:border-[var(--border-strong)] hover:bg-[var(--surface-wash)] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--field-focus-ring)] focus-visible:ring-inset motion-reduce:transition-none"
                  href={method.href}
                  key={method.mark}
                >
                  <span
                    aria-hidden="true"
                    className="contact-method-mark grid size-10 place-items-center rounded-[var(--radius-sm)] border border-[var(--border-default)] bg-[var(--surface-card-muted)] text-[11px] font-bold tracking-[var(--tracking-eyebrow-sm)] text-[var(--text)]"
                  >
                    {method.mark}
                  </span>
                  <span className="grid min-w-0 gap-0.5">
                    <strong className="truncate text-sm font-semibold leading-5 text-[var(--text)]">{method.name}</strong>
                    <span className="truncate text-xs leading-5 text-[var(--muted)]">{method.value}</span>
                  </span>
                  <span className="text-xs font-semibold text-[var(--accent)] transition-colors group-hover:text-[var(--accent-strong)]">
                    {method.actionLabel}
                  </span>
                </a>
              ))}
            </div>
          </div>
        </article>
      </div>
    </section>
  );
}
