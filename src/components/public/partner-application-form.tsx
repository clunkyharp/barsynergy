'use client';

import { useActionState } from 'react';
import {
  ContactChannelFieldset,
  HiddenUtmFields,
  HoneypotField,
  PublicFormShellFooter,
  PublicApplicationSection,
  type PublicApplicationFormProps
} from '@/components/public/application-form-section';
import type { PublicApplicationResult } from '@/lib/applications/public-form-helpers';
import { PublicBodyText, PublicDisplayTitle, PublicEyebrow } from '@/components/public/public-primitives';
import { ConsentField } from '@/components/ui/consent-field';
import { FormField, FormSection } from '@/components/ui/form-field';
import { Input } from '@/components/ui/input';
import { InlineLink } from '@/components/ui/inline-link';
import { MetaChip } from '@/components/ui/meta-chip';
import { Select } from '@/components/ui/select';
import { SubmitButton } from '@/components/ui/submit-button';
import { Textarea } from '@/components/ui/textarea';
import { useRef } from 'react';
import { useFormDraftAutoSave } from '@/lib/hooks/use-form-draft';

export function PartnerApplicationForm({ enabled, utm, cities, defaults = {}, action }: Omit<PublicApplicationFormProps, 'result'> & { action?: (prevState: PublicApplicationResult | null, formData: FormData) => Promise<PublicApplicationResult> }) {
  const [result, formAction] = useActionState(action ?? (async () => ({ type: 'error' as const, message: '' })), null);
  const formRef = useRef<HTMLFormElement>(null);
  useFormDraftAutoSave('partner-application', formRef);
  const highlights = [
    'Образовательные проекты',
    'События для заведений',
    'Партнёрские материалы',
    'Спонсорство событий'
  ];

  const preparationNotes = [
    'Кто вы и что хотите сделать вместе с BARSYNERGY.',
    'Какая задача: обучение, событие, запуск, размещение или контакт с заведениями.',
    'Ссылка на сайт, Telegram или материалы, если их уже можно посмотреть.'
  ];

  return (
    <PublicApplicationSection
      eyebrow="Партнёрство / Заявка"
      title="Обсудить партнёрство"
      description="Для брендов, школ, заведений и сервисных команд: совместный проект, событие, размещение или обучение."
      disclosureAliases={['applications']}
      disclosureFocusSelector="#partnerCompanyName"
      disclosureId="partner-request"
      disclosureOpenLabel="Описать партнёрскую задачу"
      disclosureTitle="Обсудить партнёрство"
      disclosureDescription="Укажите компанию, формат, город, ссылку и короткое описание задачи."
      disclosureDefaultOpen={Boolean(defaults.partnerType)}
      enabled={enabled}
      result={result ?? undefined}
    >
      <form action={formAction} className="editorial-form-shell public-form-shell" ref={formRef}>
        <HiddenUtmFields utm={utm} />
        <HoneypotField id="partner-application-website" />
        <div className="relative grid lg:grid-cols-[0.42fr_0.58fr]">
          <div className="relative border-b border-white/10 bg-[var(--graphite)] px-5 py-6 text-white md:px-6 md:py-7 lg:border-b-0 lg:border-r lg:border-white/10">
            <PublicEyebrow tone="inverse">Совместный проект</PublicEyebrow>
            <PublicDisplayTitle as="h3" className="mt-3 text-white" size="card">
              Заявка для брендов, школ и заведений
            </PublicDisplayTitle>
            <PublicBodyText className="mt-4 max-w-md" tone="inverse">
              Коротко опишите задачу и идею. Этого достаточно, чтобы начать разговор.
            </PublicBodyText>

            <div className="mt-6 flex flex-wrap gap-2">
              {highlights.map((item) => (
                <MetaChip className="px-3 py-2 text-white/80" key={item} variant="inverse">
                  {item}
                </MetaChip>
              ))}
            </div>

            <div className="mt-8 border-t border-white/10 pt-5">
              <PublicEyebrow tone="inverse">Что подготовить</PublicEyebrow>
              <ul className="mt-4 space-y-3 text-sm leading-6 text-white/85">
                {preparationNotes.map((item) => (
                  <li className="flex gap-3" key={item}>
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--accent)]" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="relative p-5 md:p-6">
            <FormSection title="Контактные данные">
              <div className="grid gap-4 md:grid-cols-2">
                <FormField htmlFor="partnerCompanyName" label="Компания">
                  <Input id="partnerCompanyName" name="companyName" required maxLength={180} minLength={2} placeholder="Например, Coffee Point" />
                </FormField>
                <FormField htmlFor="partnerContactName" label="Контактное лицо">
                  <Input id="partnerContactName" name="contactName" required maxLength={160} minLength={2} placeholder="Иван Иванов" />
                </FormField>
              </div>
            </FormSection>
            <ContactChannelFieldset emailId="partnerEmail" phoneId="partnerPhone" telegramId="partnerTelegram" />
            <div className="grid gap-4 md:grid-cols-2">
              <FormField htmlFor="partnerCityId" label="Город">
                <Select id="partnerCityId" name="cityId" defaultValue="">
                  <option value="">Не указан</option>
                  {cities.map((city) => (
                    <option key={city.id} value={city.id}>
                      {city.name}
                    </option>
                  ))}
                </Select>
              </FormField>
              <FormField htmlFor="partnerType" label="Тип партнёрства">
                <Input id="partnerType" name="partnerType" defaultValue={defaults.partnerType} required maxLength={160} minLength={2} placeholder="Например, совместное событие" />
              </FormField>
              <FormField htmlFor="partnerWebsiteUrl" label="Сайт">
                <Input id="partnerWebsiteUrl" name="websiteUrl" type="url" placeholder="https://example.ru" maxLength={500} />
              </FormField>
              <div className="md:col-span-2">
                <FormField htmlFor="partnerProposal" label="Предложение">
                  <Textarea
                    id="partnerProposal"
                    name="proposal"
                    required
                    className="min-h-36"
                    maxLength={4000}
                    minLength={20}
                    placeholder="Например: хотим провести совместную дегустацию и серию материалов для специалистов региона."
                  />
                </FormField>
              </div>
              <div className="md:col-span-2 border-t border-black/10 pt-1">
                <ConsentField>
                  Согласен с <InlineLink href="/legal/privacy">политикой обработки персональных данных</InlineLink> и даю{' '}
                  <InlineLink href="/legal/personal-data-consent">согласие на обработку персональных данных</InlineLink> для этой заявки.
                </ConsentField>
              </div>
              <PublicFormShellFooter className="md:col-span-2" note="После отправки свяжемся и обсудим следующий шаг.">
                <SubmitButton>Отправить заявку</SubmitButton>
              </PublicFormShellFooter>
            </div>
          </div>
        </div>
      </form>
    </PublicApplicationSection>
  );
}
