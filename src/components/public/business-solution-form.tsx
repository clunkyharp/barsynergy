import { submitBusinessSolutionRequest } from '@/app/(public)/business/actions';
import {
  ContactChannelFieldset,
  HiddenUtmFields,
  HoneypotField,
  PublicApplicationSection,
  PublicFormShellFooter,
  type PublicApplicationFormProps
} from '@/components/public/application-form-section';
import { PublicBodyText, PublicDisplayTitle, PublicEyebrow } from '@/components/public/public-primitives';
import { ConsentField } from '@/components/ui/consent-field';
import { FormField } from '@/components/ui/form-field';
import { InlineLink } from '@/components/ui/inline-link';
import { Input } from '@/components/ui/input';
import { MetaChip } from '@/components/ui/meta-chip';
import { Select } from '@/components/ui/select';
import { SubmitButton } from '@/components/ui/submit-button';
import { Textarea } from '@/components/ui/textarea';
import { businessSolutionTypeOptions } from '@/lib/applications/b2b-request-options';

export function BusinessSolutionForm({ enabled, result, utm, cities, defaults = {} }: PublicApplicationFormProps) {
  return (
    <PublicApplicationSection
      eyebrow="Для бизнеса / Заявка"
      title="Описать рабочую задачу"
      description="Подходит для сайта заведения, Telegram-бота, внутренней формы, уведомлений или простой панели."
      disclosureAliases={['applications']}
      disclosureDescription="Укажите проект, город, контакт и тип решения. После заявки уточним детали."
      disclosureFocusSelector="#businessProjectName"
      disclosureId="business-request"
      disclosureOpenLabel="Оставить заявку"
      disclosureTitle="Заявка на бизнес-решение"
      enabled={enabled}
      result={result}
    >
      <form action={submitBusinessSolutionRequest} className="editorial-form-shell public-form-shell">
        <HiddenUtmFields utm={utm} />
        <HoneypotField id="business-solution-website" />
        <div className="relative grid lg:grid-cols-[0.42fr_0.58fr]">
          <div className="relative border-b border-white/10 bg-[var(--graphite)] px-5 py-6 text-white md:px-6 md:py-7 lg:border-b-0 lg:border-r lg:border-white/10">
            <PublicEyebrow tone="inverse">B2B-задача</PublicEyebrow>
            <PublicDisplayTitle as="h3" className="mt-3 text-white" size="card">
              Цифровой инструмент под конкретный процесс
            </PublicDisplayTitle>
            <PublicBodyText className="mt-4 max-w-md" tone="inverse">
              Опишите задачу и как всё работает сейчас. Тарифы и оплату в этой форме не собираем.
            </PublicBodyText>

            <div className="mt-6 flex flex-wrap gap-2">
              {businessSolutionTypeOptions.map((option) => (
                <MetaChip className="px-3 py-2 text-white/80" key={option.value} variant="inverse">
                  {option.label}
                </MetaChip>
              ))}
            </div>

            <div className="mt-8 border-t border-white/10 pt-5">
              <PublicEyebrow tone="inverse">Что написать</PublicEyebrow>
              <ul className="mt-4 space-y-3 text-sm leading-6 text-white/74">
                <li className="flex gap-3">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--accent)]" />
                  <span>Что нужно упростить: заявки, вакансии, уведомления, сайт или внутренний список.</span>
                </li>
                <li className="flex gap-3">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--accent)]" />
                  <span>Кто будет пользоваться: гости, кандидаты, администратор или команда смены.</span>
                </li>
                <li className="flex gap-3">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--accent)]" />
                  <span>Что сейчас мешает: ручные сообщения, потеря заявок, лишние таблицы или долгие согласования.</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="relative p-5 md:p-6">
            <div className="grid gap-4 md:grid-cols-2">
              <FormField htmlFor="businessProjectName" label="Проект или заведение">
                <Input
                  autoComplete="organization"
                  defaultValue={defaults.projectName}
                  id="businessProjectName"
                  maxLength={180}
                  minLength={2}
                  name="projectName"
                  required
                />
              </FormField>
              <FormField htmlFor="businessContactName" label="Контактное лицо">
                <Input
                  autoComplete="name"
                  defaultValue={defaults.contactName}
                  id="businessContactName"
                  maxLength={160}
                  minLength={2}
                  name="contactName"
                  required
                />
              </FormField>
              <ContactChannelFieldset className="md:col-span-2" emailId="businessEmail" phoneId="businessPhone" telegramId="businessTelegram" />
              <FormField htmlFor="businessCityId" label="Город">
                <Select id="businessCityId" name="cityId" defaultValue={defaults.cityId ?? ''} required>
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
              <FormField htmlFor="businessSolutionType" label="Тип решения">
                <Select id="businessSolutionType" name="solutionType" defaultValue={defaults.solutionType ?? ''} required>
                  <option value="" disabled>
                    Выберите тип
                  </option>
                  {businessSolutionTypeOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Select>
              </FormField>
              <div className="md:col-span-2">
                <FormField htmlFor="businessComment" hint="Опишите задачу, текущий процесс и что должно измениться после запуска." label="Что нужно сделать">
                  <Textarea
                    className="min-h-40"
                    defaultValue={defaults.comment}
                    id="businessComment"
                    maxLength={4000}
                    minLength={20}
                    name="comment"
                    required
                  />
                </FormField>
              </div>
              <div className="md:col-span-2 border-t border-black/10 pt-1">
                <ConsentField>
                  Согласен с <InlineLink href="/legal/privacy">политикой обработки персональных данных</InlineLink> и даю{' '}
                  <InlineLink href="/legal/personal-data-consent">согласие на обработку персональных данных</InlineLink> для этой заявки.
                </ConsentField>
              </div>
              <PublicFormShellFooter className="md:col-span-2" note="После отправки свяжемся по указанному способу связи.">
                <SubmitButton>Отправить заявку</SubmitButton>
              </PublicFormShellFooter>
            </div>
          </div>
        </div>
      </form>
    </PublicApplicationSection>
  );
}
