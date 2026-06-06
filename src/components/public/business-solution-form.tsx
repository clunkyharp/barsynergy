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
import { PublicFormValidation } from '@/components/public/public-form-validation';
import { ConsentField } from '@/components/ui/consent-field';
import { FormField, FormSection } from '@/components/ui/form-field';
import { InlineLink } from '@/components/ui/inline-link';
import { Input } from '@/components/ui/input';
import { MetaChip } from '@/components/ui/meta-chip';
import { Select } from '@/components/ui/select';
import { SubmitButton } from '@/components/ui/submit-button';
import { Textarea } from '@/components/ui/textarea';
import { businessVenueTypeOptions } from '@/lib/applications/b2b-request-options';

type BusinessSolutionFormProps = PublicApplicationFormProps & {
  direct?: boolean;
};

export function BusinessSolutionForm({ enabled, result, utm, cities, defaults = {}, direct = false }: BusinessSolutionFormProps) {
  return (
    <PublicApplicationSection
      eyebrow="Каталог / Заявка"
      title="Разместить кофейный бар в каталоге"
      description="Для кофеен, specialty-проектов, обжарочных и других точек, которые хотят попасть в каталог СКФО."
      disclosureAliases={['applications']}
      disclosureDescription="Укажите заведение, город, тип, контакт и короткий комментарий. После заявки уточним детали."
      disclosureFocusSelector="#businessProjectName"
      disclosureId={direct ? undefined : 'business-request'}
      disclosureOpenLabel="Разместить заведение"
      disclosureTitle="Заявка на размещение"
      enabled={enabled}
      introVariant={direct ? 'compact' : undefined}
      result={result}
      sectionId="business-request"
    >
      <form action={submitBusinessSolutionRequest} className="editorial-form-shell public-form-shell" noValidate>
        <PublicFormValidation />
        <HiddenUtmFields utm={utm} />
        <HoneypotField id="business-solution-website" />
        <div className="relative grid lg:grid-cols-[0.42fr_0.58fr]">
          <div className="relative border-b border-[var(--editorial-dark-border)] bg-[var(--editorial-dark-surface)] px-5 py-6 text-[var(--editorial-dark-text)] md:px-6 md:py-7 lg:border-b-0 lg:border-r lg:border-[var(--editorial-dark-border)]">
            <PublicEyebrow tone="inverse">Каталог СКФО</PublicEyebrow>
            <PublicDisplayTitle as="h3" className="mt-3 text-white" size="card">
              Проверим данные и подготовим карточку
            </PublicDisplayTitle>
            <PublicBodyText className="mt-4 max-w-md" tone="inverse">
              В форме не собираем оплату. Нужны только данные, по которым команда сможет связаться и уточнить карточку.
            </PublicBodyText>

            <div className="mt-6 flex flex-wrap gap-2">
              {businessVenueTypeOptions.map((option) => (
                <MetaChip className="px-3 py-2 text-white/80" key={option.value} variant="inverse">
                  {option.label}
                </MetaChip>
              ))}
            </div>

            <div className="mt-8 border-t border-white/10 pt-5">
              <PublicEyebrow tone="inverse">Что написать</PublicEyebrow>
              <ul className="mt-4 space-y-3 text-sm leading-6 text-white/85">
                <li className="flex gap-3">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--accent)]" />
                  <span>Как называется заведение и в каком городе оно работает.</span>
                </li>
                <li className="flex gap-3">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--accent)]" />
                  <span>К какому формату его отнести: кофейный бар, specialty, обжарочное или другое.</span>
                </li>
                <li className="flex gap-3">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--accent)]" />
                  <span>Что важно показать в карточке: кухня, кофе, бар, события, сайт или соцсети.</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="relative p-5 md:p-6">
            <FormSection title="Контакт">
              <div className="grid gap-4 md:grid-cols-2">
                <FormField htmlFor="businessProjectName" label="Название заведения">
                  <Input
                    autoComplete="organization"
                    defaultValue={defaults.projectName}
                    id="businessProjectName"
                    maxLength={180}
                    minLength={2}
                    name="projectName"
                    placeholder="Например, Brew Yard"
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
                    placeholder="Иван Иванов"
                    required
                  />
                </FormField>
                <ContactChannelFieldset className="md:col-span-2" emailId="businessEmail" phoneId="businessPhone" telegramId="businessTelegram" />
              </div>
            </FormSection>
            <FormSection title="О заведении">
              <div className="grid gap-4 md:grid-cols-2">
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
              <FormField htmlFor="businessSolutionType" label="Тип">
                <Select id="businessSolutionType" name="solutionType" defaultValue={defaults.solutionType ?? ''} required>
                  <option value="" disabled>
                    Выберите тип
                  </option>
                  {businessVenueTypeOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Select>
              </FormField>
            </div>
            </FormSection>
            <FormSection title="Уточнения">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="md:col-span-2">
                  <FormField htmlFor="businessComment" hint="Укажите сайт или соцсети, особенности заведения и что важно показать в каталоге." label="Комментарий">
                    <Textarea
                      className="min-h-40"
                      defaultValue={defaults.comment}
                      id="businessComment"
                      maxLength={4000}
                      minLength={20}
                      name="comment"
                      placeholder="Например: кофейный бар в центре Пятигорска, хотим карточку с меню завтраков, кофе и ссылками на соцсети."
                      required
                    />
                  </FormField>
                </div>
            </div>
            </FormSection>
            <div className="border-t border-black/10 pt-1">
              <ConsentField>
                  Согласен с <InlineLink href="/legal/privacy">политикой обработки персональных данных</InlineLink> и даю{' '}
                  <InlineLink href="/legal/personal-data-consent">согласие на обработку персональных данных</InlineLink> для этой заявки.
                </ConsentField>
              </div>
              <PublicFormShellFooter note="После отправки свяжемся по указанному способу связи.">
                <SubmitButton>Отправить заявку</SubmitButton>
              </PublicFormShellFooter>
          </div>
        </div>
      </form>
    </PublicApplicationSection>
  );
}
