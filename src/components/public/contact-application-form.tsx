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
import {
  contactTopicOptions,
  getContactMessageHint,
  getContactMessageLabel,
  getContactMessagePlaceholder,
  getContactTopicDetailsHint,
  getContactTopicDetailsTitle,
  shouldShowContactTopicDetails,
  type ContactTopicValue
} from './contact-application-form-constants';

export { contactTopicOptions, type ContactTopicValue } from './contact-application-form-constants';

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
        titleSize="card-compact"
      />
      <div className="relative p-5 md:p-6">
        <div className="grid gap-4">
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
        Если вопрос срочный, напишите в Telegram команды.
      </p>
      <Button className="mt-6 rounded-[var(--radius-md)] sm:self-start" href="https://t.me/barsynergy" size="lg" variant="secondary">
        Написать в Telegram
      </Button>
    </EditorialShell>
  );

  return form;
}
