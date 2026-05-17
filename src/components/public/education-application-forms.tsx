import {
  submitCertificateOrderApplication,
  submitCorporateTrainingApplication,
  submitCourseApplication
} from '@/app/(public)/education/actions';
import {
  ContactChannelFieldset,
  HiddenUtmFields,
  HoneypotField,
  PublicApplicationSection,
  PublicFormShellFooter,
  PublicFormShellHeader,
  type PublicApplicationFormProps
} from '@/components/public/application-form-section';
import { AppLink } from '@/components/ui/app-link';
import { Button } from '@/components/ui/button';
import { ConsentField } from '@/components/ui/consent-field';
import { FormField } from '@/components/ui/form-field';
import { Input } from '@/components/ui/input';
import { InlineLink } from '@/components/ui/inline-link';
import { Select } from '@/components/ui/select';
import { SubmitButton } from '@/components/ui/submit-button';
import { Textarea } from '@/components/ui/textarea';

export function EducationApplicationForms({ enabled, result, utm, cities, defaults = {} }: PublicApplicationFormProps) {
  const selectedFormType =
    defaults.formType === 'course' || defaults.formType === 'corporate' || defaults.formType === 'certificate'
      ? defaults.formType
      : undefined;
  const activeFormType = selectedFormType ?? 'course';
  const hasSelectedCourse = Boolean(defaults.courseTitle?.trim());
  const showCourseForm = activeFormType === 'course';
  const showCorporateTrainingForm = activeFormType === 'corporate' && !hasSelectedCourse;
  const showCertificateOrderForm = activeFormType === 'certificate' && !hasSelectedCourse;

  const requestOptions = [
    {
      href: '/education?formType=course#education-request',
      label: 'Заявка на программу',
      description: 'Если хотите записаться или подобрать тему.'
    },
    {
      href: '/education?formType=corporate#education-request',
      label: 'Корпоративное обучение',
      description: 'Если нужно обучение для команды или заведения.'
    },
    {
      href: '/education?formType=certificate#education-request',
      label: 'Заказ сертификата',
      description: 'Если нужен подарочный или командный сертификат.'
    },
    {
      href: '/education?formType=course&courseTitle=%D0%9F%D1%80%D0%B5%D0%B4%D0%BB%D0%BE%D0%B6%D0%B8%D1%82%D1%8C%20%D1%82%D0%B5%D0%BC%D1%83#education-request',
      label: 'Предложить тему',
      description: 'Если хотите отправить тему занятия или разбора.'
    }
  ];

  return (
    <PublicApplicationSection
      eyebrow="Образование / Заявки"
      title="Заявки на обучение"
      description="Можно записаться на программу, запросить обучение для команды или заказать сертификат."
      disclosureAliases={['applications']}
      disclosureClosedContent={
        <div>
          <div className="max-w-3xl">
            <h3 className="text-lg font-semibold leading-7 text-[var(--text)]">Выберите тип заявки</h3>
            <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
              Выберите, что нужно отправить: программу, обучение команды, сертификат или тему занятия.
            </p>
          </div>
          <div className="mt-5 grid gap-3 md:grid-cols-2">
            {requestOptions.map((option) => (
              <AppLink
                className="group rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--surface)] p-4 transition hover:border-[var(--accent)]/30 hover:bg-[var(--surface-wash-strong)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)]"
                href={option.href}
                key={option.label}
              >
                <span className="text-sm font-semibold leading-6 text-[var(--text)] group-hover:text-[var(--accent)]">{option.label}</span>
                <span className="mt-1 block text-sm leading-6 text-[var(--muted)]">{option.description}</span>
              </AppLink>
            ))}
          </div>
          <div className="mt-5">
            <Button className="rounded-[var(--radius-md)] px-5" href="/education?formType=course#education-request">
              Заполнить заявку
            </Button>
          </div>
        </div>
      }
      disclosureDefaultOpen={Boolean(selectedFormType || result)}
      disclosureFocusSelector={
        activeFormType === 'corporate'
          ? '#trainingCompanyName'
          : activeFormType === 'certificate'
            ? '#certificateCustomerName'
            : '#courseName'
      }
      disclosureId="education-request"
      disclosureShowDefaultTrigger={false}
      enabled={enabled}
      result={result}
    >
      <div className="grid grid-flow-dense gap-6 lg:grid-cols-2">
        {showCourseForm ? (
          <form action={submitCourseApplication} className="editorial-form-shell h-full">
            <HiddenUtmFields utm={utm} />
            <HoneypotField id="course-application-website" />
            <PublicFormShellHeader
              eyebrow="Индивидуальный запрос"
              title="Заявка на программу"
              description="Укажите тему, город и что нужно разобрать на занятии."
            />
            <div className="relative p-5 md:p-6">
              <div className="grid gap-4">
                <FormField htmlFor="courseName" label="Имя">
                  <Input id="courseName" name="name" required maxLength={160} minLength={2} />
                </FormField>
                <ContactChannelFieldset emailId="courseEmail" phoneId="coursePhone" telegramId="courseTelegram" />
                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField htmlFor="courseCityId" label="Город">
                    <Select id="courseCityId" name="cityId" defaultValue="">
                      <option value="">Не указан</option>
                      {cities.map((city) => (
                        <option key={city.id} value={city.id}>
                          {city.name}
                        </option>
                      ))}
                    </Select>
                  </FormField>
                </div>
                <FormField htmlFor="courseTitle" label="Интересующая программа или тема">
                  <Input id="courseTitle" name="courseTitle" defaultValue={defaults.courseTitle} required maxLength={180} minLength={2} />
                </FormField>
                <FormField htmlFor="courseGoals" label="Что нужно разобрать">
                  <Textarea id="courseGoals" name="goals" required className="min-h-36" maxLength={3000} minLength={10} />
                </FormField>
                <ConsentField>
                  Согласен с <InlineLink href="/legal/privacy">политикой обработки персональных данных</InlineLink> и даю{' '}
                  <InlineLink href="/legal/personal-data-consent">согласие на обработку персональных данных</InlineLink> для этой заявки.
                </ConsentField>
              </div>
              <PublicFormShellFooter note="После отправки свяжемся и уточним формат, дату и условия.">
                <SubmitButton className="min-h-12 rounded-[var(--radius-md)] px-6 tracking-normal sm:self-start">
                  Отправить заявку
                </SubmitButton>
              </PublicFormShellFooter>
            </div>
          </form>
        ) : null}

        {showCorporateTrainingForm ? (
          <form action={submitCorporateTrainingApplication} className="editorial-form-shell h-full">
            <HiddenUtmFields utm={utm} />
            <HoneypotField id="corporate-training-website" />
            <PublicFormShellHeader
              eyebrow="Командный формат"
              title="Корпоративное обучение"
              description="Опишите команду, задачу, город и желаемые сроки."
            />
            <div className="relative p-5 md:p-6">
              <div className="grid gap-4">
                <FormField htmlFor="trainingCompanyName" label="Компания">
                  <Input id="trainingCompanyName" name="companyName" required maxLength={180} minLength={2} />
                </FormField>
                <FormField htmlFor="trainingContactName" label="Контактное лицо">
                  <Input id="trainingContactName" name="contactName" required maxLength={160} minLength={2} />
                </FormField>
                <ContactChannelFieldset emailId="trainingEmail" phoneId="trainingPhone" telegramId="trainingTelegram" />
                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField htmlFor="trainingCityId" label="Город">
                    <Select id="trainingCityId" name="cityId" defaultValue="">
                      <option value="">Не указан</option>
                      {cities.map((city) => (
                        <option key={city.id} value={city.id}>
                          {city.name}
                        </option>
                      ))}
                    </Select>
                  </FormField>
                </div>
                <FormField htmlFor="trainingTeamSize" label="Размер команды">
                  <Input id="trainingTeamSize" name="teamSize" required maxLength={80} minLength={1} />
                </FormField>
                <FormField htmlFor="trainingRequest" label="Задача команды">
                  <Textarea
                    id="trainingRequest"
                    name="requestDetails"
                    defaultValue={defaults.trainingRequest}
                    required
                    className="min-h-36"
                    maxLength={4000}
                    minLength={20}
                  />
                </FormField>
                <ConsentField>
                  Согласен с <InlineLink href="/legal/privacy">политикой обработки персональных данных</InlineLink> и даю{' '}
                  <InlineLink href="/legal/personal-data-consent">согласие на обработку персональных данных</InlineLink> для этой заявки.
                </ConsentField>
              </div>
              <PublicFormShellFooter note="После отправки обсудим длительность, состав участников и ближайший формат.">
                <SubmitButton className="min-h-12 rounded-[var(--radius-md)] px-6 tracking-normal sm:self-start">
                  Отправить запрос
                </SubmitButton>
              </PublicFormShellFooter>
            </div>
          </form>
        ) : null}

        {showCertificateOrderForm ? (
          <form action={submitCertificateOrderApplication} className="editorial-form-shell h-full lg:col-span-2">
            <HiddenUtmFields utm={utm} />
            <HoneypotField id="certificate-order-website" />
            <PublicFormShellHeader
              eyebrow="Подарочный формат"
              title="Заказ сертификата"
              description="Укажите получателя, сумму или формат и контакт для связи."
            />
            <div className="relative p-5 md:p-6">
              <div className="grid gap-4 md:grid-cols-2">
                <FormField htmlFor="certificateCustomerName" label="Ваше имя">
                  <Input id="certificateCustomerName" name="name" required maxLength={160} minLength={2} />
                </FormField>
                <FormField htmlFor="recipientName" label="Получатель сертификата">
                  <Input id="recipientName" name="recipientName" required maxLength={160} minLength={2} />
                </FormField>
                <ContactChannelFieldset className="md:col-span-2" emailId="certificateEmail" phoneId="certificatePhone" telegramId="certificateTelegram" />
                <FormField htmlFor="certificateCityId" label="Город">
                  <Select id="certificateCityId" name="cityId" defaultValue="">
                    <option value="">Не указан</option>
                    {cities.map((city) => (
                      <option key={city.id} value={city.id}>
                        {city.name}
                      </option>
                    ))}
                  </Select>
                </FormField>
                <FormField htmlFor="certificateAmount" label="Номинал или сумма">
                  <Input id="certificateAmount" name="amountLabel" required maxLength={120} minLength={1} />
                </FormField>
                <FormField className="md:col-span-2" htmlFor="certificateMessage" label="Комментарий к сертификату">
                  <Textarea id="certificateMessage" name="message" required className="min-h-36" maxLength={3000} minLength={10} />
                </FormField>
                <div className="md:col-span-2">
                  <ConsentField>
                    Согласен с <InlineLink href="/legal/privacy">политикой обработки персональных данных</InlineLink> и даю{' '}
                    <InlineLink href="/legal/personal-data-consent">согласие на обработку персональных данных</InlineLink> для этой заявки.
                  </ConsentField>
                </div>
              </div>
              <PublicFormShellFooter
                className="md:items-center"
                note="Если нужен корпоративный сертификат или нестандартный формат, напишите об этом в комментарии."
              >
                <SubmitButton className="min-h-12 rounded-[var(--radius-md)] px-6 tracking-normal sm:self-start">
                  Отправить заказ
                </SubmitButton>
              </PublicFormShellFooter>
            </div>
          </form>
        ) : null}
      </div>
    </PublicApplicationSection>
  );
}
