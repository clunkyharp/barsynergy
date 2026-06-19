'use client';

import { useActionState } from 'react';
import {
  ContactChannelFieldset,
  HiddenUtmFields,
  HoneypotField,
  PublicApplicationSection,
  PublicFormShellFooter,
  type PublicApplicationFormProps
} from '@/components/public/application-form-section';
import type { PublicApplicationResult } from '@/lib/applications/public-form-helpers';
import { PublicBodyText, PublicDisplayTitle, PublicEyebrow } from '@/components/public/public-primitives';
import { PublicFormValidation } from '@/components/public/public-form-validation';
import { ConsentField } from '@/components/ui/consent-field';
import { FormField, FormSection } from '@/components/ui/form-field';
import { InlineLink } from '@/components/ui/inline-link';
import { Input } from '@/components/ui/input';
import { MetaChip } from '@/components/ui/meta-chip';
import { Select } from '@/components/ui/select';
import { SubmitButton } from '@/components/ui/submit-button';
import { Textarea } from '@/components/ui/textarea';
import {
  consultingBusinessTypeOptions,
  consultingDirectionOptions,
  consultingExpertOptions,
  consultingProjectStageOptions
} from '@/lib/applications/b2b-request-options';
import { useRef } from 'react';
import { useFormDraftAutoSave } from '@/lib/hooks/use-form-draft';

type ConsultingRequestFormProps = Omit<PublicApplicationFormProps, 'result'> & {
  direct?: boolean;
  action: (prevState: PublicApplicationResult | null, formData: FormData) => Promise<PublicApplicationResult>;
};

export function ConsultingRequestForm({ enabled, utm, cities, defaults = {}, direct = false, action }: ConsultingRequestFormProps) {
  const [result, formAction] = useActionState(action, null);
  const formRef = useRef<HTMLFormElement>(null);
  useFormDraftAutoSave('consulting-request', formRef);

  return (
    <PublicApplicationSection
      eyebrow="Консалтинг / Заявка"
      title="Описать задачу для эксперта"
      description="Для запуска, барной карты, обучения команды, экономики, закупок и проверки процессов."
      disclosureAliases={['applications']}
      disclosureDescription="Укажите формат бизнеса, стадию проекта, направление и задачу."
      disclosureFocusSelector="#consultingContactName"
      disclosureId={direct ? undefined : 'consulting-request'}
      disclosureOpenLabel="Описать задачу"
      disclosureTitle="Заявка на консультацию"
      enabled={enabled}
      introVariant={direct ? 'compact' : undefined}
      result={result ?? undefined}
      sectionId="consulting-request"
    >
      <form action={formAction} className="editorial-form-shell public-form-shell" noValidate ref={formRef}>
        <PublicFormValidation />
        <HiddenUtmFields utm={utm} />
        <HoneypotField id="consulting-request-website" />
        <div className="relative grid lg:grid-cols-[0.42fr_0.58fr]">
          <div className="relative border-b border-[var(--editorial-dark-border)] bg-[var(--editorial-dark-surface)] px-5 py-6 text-[var(--editorial-dark-text)] md:px-6 md:py-7 lg:border-b-0 lg:border-r lg:border-[var(--editorial-dark-border)]">
            <PublicEyebrow tone="inverse">Экспертная помощь</PublicEyebrow>
            <PublicDisplayTitle as="h3" className="mt-3 text-white" size="card">
              Разбор задачи и определение последующих действий 
            </PublicDisplayTitle>
            <PublicBodyText className="mt-4 max-w-md" tone="inverse">
              Опишите, что нужно разобрать. После заявки уточним формат консультации и специалиста.
            </PublicBodyText>

            <div className="mt-6 flex flex-wrap gap-2">
              {consultingDirectionOptions.map((option) => (
                <MetaChip className="px-3 py-2 text-white/80" key={option.value} variant="inverse">
                  {option.label}
                </MetaChip>
              ))}
            </div>

            <div className="mt-8 border-t border-white/10 pt-5">
              <PublicEyebrow tone="inverse">Что подготовить</PublicEyebrow>
              <ul className="mt-4 space-y-3 text-sm leading-6 text-white/85">
                <li className="flex gap-3">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--accent)]" />
                  <span>Стадию проекта: идея, запуск, действующее заведение или перезапуск.</span>
                </li>
                <li className="flex gap-3">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--accent)]" />
                  <span>Что нужно улучшить: меню, команду, себестоимость, закупки или порядок работы.</span>
                </li>
                <li className="flex gap-3">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--accent)]" />
                  <span>Какие ограничения уже есть: город, сроки, бюджет, текущий формат работы.</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="relative p-5 md:p-6">
            <FormSection title="Контактные данные">
              <div className="grid items-start gap-4 md:grid-cols-2">
                <FormField htmlFor="consultingContactName" label="Контактное лицо">
                  <Input
                    autoComplete="name"
                    defaultValue={defaults.contactName}
                    id="consultingContactName"
                    maxLength={160}
                    minLength={2}
                    name="contactName"
                    placeholder="Иван Иванов"
                    required
                  />
                </FormField>
                <FormField htmlFor="consultingCityId" hint="Нужен для подбора эксперта в вашем городе" label="Город">
                  <Select id="consultingCityId" name="cityId" defaultValue={defaults.cityId ?? ''} required>
                  <option value="" disabled>
                    Выберите город
                  </option>
                  {cities.map((city) => (
                    <option key={city.id} value={city.id}>
                      {city.name}
                    </option>
                  ))}
                </Select>
              </FormField>
            </div>
            </FormSection>
            <ContactChannelFieldset emailId="consultingEmail" phoneId="consultingPhone" telegramId="consultingTelegram" />
            <FormSection title="О бизнесе">
            <div className="grid gap-4 md:grid-cols-2">
              <FormField htmlFor="consultingBusinessType" label="Тип бизнеса">
                <Select id="consultingBusinessType" name="businessType" defaultValue={defaults.businessType ?? ''} required>
                  <option value="" disabled>
                    Выберите формат
                  </option>
                  {consultingBusinessTypeOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Select>
              </FormField>
              <FormField htmlFor="consultingProjectStage" label="Стадия проекта">
                <Select id="consultingProjectStage" name="projectStage" defaultValue={defaults.projectStage ?? ''} required>
                  <option value="" disabled>
                    Выберите стадию
                  </option>
                  {consultingProjectStageOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Select>
              </FormField>
              <FormField htmlFor="consultingDirection" label="Направление">
                <Select id="consultingDirection" name="consultingDirection" defaultValue={defaults.consultingDirection ?? ''} required>
                  <option value="" disabled>
                    Выберите направление
                  </option>
                  {consultingDirectionOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Select>
              </FormField>
              <FormField htmlFor="consultingPreferredExpert" label="Предпочтительный эксперт">
                <Select id="consultingPreferredExpert" name="preferredExpert" defaultValue={defaults.preferredExpert ?? ''}>
                  <option value="">Не выбран</option>
                  {consultingExpertOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Select>
              </FormField>
            </div>
            </FormSection>
            <FormSection title="Задача">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="md:col-span-2">
                <FormField htmlFor="consultingTaskDescription" hint="Опишите задачу и что должно стать понятнее после консультации." label="Описание задачи">
                  <Textarea
                    className="min-h-40"
                    defaultValue={defaults.taskDescription}
                    id="consultingTaskDescription"
                    maxLength={4000}
                    minLength={20}
                    name="taskDescription"
                    placeholder="Например: нужно пересобрать барную карту и понять, как снизить себестоимость без потери качества."
                    required
                  />
                </FormField>
              </div>
            </div>
            </FormSection>
            <div className="md:col-span-2 border-t border-black/10 pt-1">
              <ConsentField>
                  Согласен с <InlineLink href="/legal/privacy">политикой обработки персональных данных</InlineLink> и даю{' '}
                  <InlineLink href="/legal/personal-data-consent">согласие на обработку персональных данных</InlineLink> для этой заявки.
                </ConsentField>
              </div>
              <PublicFormShellFooter className="md:col-span-2" note="После отправки уточним задачу и формат консультации.">
                <SubmitButton>Отправить заявку</SubmitButton>
              </PublicFormShellFooter>
          </div>
        </div>
      </form>
    </PublicApplicationSection>
  );
}
