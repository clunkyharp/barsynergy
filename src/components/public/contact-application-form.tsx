'use client';

import { useMemo, useState } from 'react';
import { submitContactMessage } from '@/app/(public)/contacts/actions';
import {
  HiddenUtmFields,
  HoneypotField,
  ContactChannelFieldset,
  PublicFormShellFooter,
  PublicFormShellHeader,
  PublicSubmissionFeedback,
  type PublicApplicationFormProps
} from '@/components/public/application-form-section';
import { Button } from '@/components/ui/button';
import { ConsentField } from '@/components/ui/consent-field';
import { EditorialShell } from '@/components/ui/editorial-shell';
import { FormField, FormSection } from '@/components/ui/form-field';
import { Input } from '@/components/ui/input';
import { InlineLink } from '@/components/ui/inline-link';
import { Select } from '@/components/ui/select';
import { SubmitButton } from '@/components/ui/submit-button';
import { Textarea } from '@/components/ui/textarea';

const PUBLIC_CONTACT_EMAIL = 'Rushgroupbar@gmail.com';

const contactMethods: {
  mark: string;
  name: string;
  value: string;
  href: string;
  actionLabel: string;
}[] = [
  {
    mark: 'EM',
    name: 'Основная почта',
    value: PUBLIC_CONTACT_EMAIL,
    href: `mailto:${PUBLIC_CONTACT_EMAIL}`,
    actionLabel: 'Написать'
  },
  {
    mark: 'TG',
    name: 'Telegram',
    value: '@barsynergy',
    href: 'https://t.me/barsynergy',
    actionLabel: 'Открыть'
  }
];

const contactTopicOptions = [
  {
    value: 'education-program',
    label: 'Обучение',
    description: 'Для команды, темы занятия или заявки на программу.'
  },
  {
    value: 'event',
    label: 'Событие',
    description: 'Для участия, добавления события или новой встречи.'
  },
  {
    value: 'vacancy-placement',
    label: 'Вакансия',
    description: 'Для размещения роли, поиска сотрудника и получения откликов.'
  },
  {
    value: 'supplier',
    label: 'Поставщик',
    description: 'Для заявки в каталог, компании или сервисной услуги.'
  },
  {
    value: 'partnership',
    label: 'Партнёрство',
    description: 'Для совместного проекта, размещения, обучения или материала.'
  },
  {
    value: 'sponsorship',
    label: 'Спонсорство',
    description: 'Для участия бренда в сезоне, событиях или материалах.'
  },
  {
    value: 'consulting',
    label: 'Консалтинг',
    description: 'Для запуска, меню, команды, закупок, экономики или проверки процессов.'
  },
  {
    value: 'article-topic',
    label: 'Материал или интервью',
    description: 'Для темы статьи, героя интервью или кейса.'
  },
  {
    value: 'other',
    label: 'Другое',
    description: 'Если запрос не подходит под другие темы.'
  }
] as const;

type ContactTopicValue = (typeof contactTopicOptions)[number]['value'];

export function ContactApplicationForm({ enabled, result, utm, cities, defaultTopic, defaults = {} }: PublicApplicationFormProps) {
  const hasDefaultTopic = contactTopicOptions.some((option) => option.value === defaultTopic);
  const initialTopic = hasDefaultTopic ? (defaultTopic as ContactTopicValue) : 'other';
  const [topic, setTopic] = useState<ContactTopicValue>(initialTopic);
  const selectedTopic = useMemo(
    () => contactTopicOptions.find((option) => option.value === topic) ?? contactTopicOptions.at(-1)!,
    [topic]
  );
  const messageLabel =
    topic === 'vacancy-placement'
      ? 'Описание вакансии'
      : topic === 'supplier'
        ? 'Что поставляете и как работаете'
        : topic === 'event'
          ? 'Расскажите о событии'
          : topic === 'partnership'
            ? 'Какой формат партнёрства хотите обсудить'
            : topic === 'sponsorship'
              ? 'Какие условия спонсорства нужны'
              : topic === 'consulting'
                ? 'Опишите задачу для консультации'
                : topic === 'article-topic'
                  ? 'О чём должен быть материал'
                  : topic === 'education-program'
                    ? 'Что нужно по обучению'
                    : 'Сообщение';

  const form = enabled ? (
    <form action={submitContactMessage} className="editorial-form-shell public-form-shell">
      <HiddenUtmFields utm={utm} />
      <HoneypotField id="contact-message-website" />
      <PublicFormShellHeader
        eyebrow="Сообщение"
        title="Форма обращения"
        description="Выберите тему, укажите контакт и коротко опишите задачу."
        headingLevel="h2"
      />
      <div className="relative p-5 md:p-6">
        <div className="grid gap-6">
          <FormSection title="Основное">
            <div className="grid gap-4 md:grid-cols-2">
              <FormField htmlFor="contactName" label="Имя">
                <Input autoComplete="name" id="contactName" name="name" required maxLength={160} minLength={2} />
              </FormField>
              <FormField htmlFor="contactTopic" label="Тема">
                <Select id="contactTopic" name="topic" onChange={(event) => setTopic(event.target.value as ContactTopicValue)} required value={topic}>
                  {contactTopicOptions.map((topic) => (
                    <option key={topic.value} value={topic.value}>
                      {topic.label}
                    </option>
                  ))}
                </Select>
              </FormField>
              <p className="form-inline-note md:col-span-2">{selectedTopic.description}</p>
            </div>
          </FormSection>

          <FormSection title="Контакты" description="Укажите email, телефон или Telegram.">
            <ContactChannelFieldset emailId="contactEmail" phoneId="contactPhone" telegramId="contactTelegram" />
          </FormSection>

          <FormSection title="Детали">
            <div className="grid gap-4 md:grid-cols-2">
              <FormField htmlFor="contactCityId" label="Город">
                <Select id="contactCityId" name="cityId" defaultValue="">
                  <option value="">Не указан</option>
                  {cities.map((city) => (
                    <option key={city.id} value={city.id}>
                      {city.name}
                    </option>
                  ))}
                </Select>
              </FormField>
                {(topic === 'education-program' ||
                  topic === 'vacancy-placement' ||
                  topic === 'supplier' ||
                  topic === 'partnership' ||
                  topic === 'sponsorship' ||
                  topic === 'consulting') ? (
                  <FormField htmlFor="contactCompanyName" label="Компания">
                    <Input autoComplete="organization" id="contactCompanyName" name="companyName" defaultValue={defaults.companyName} maxLength={180} />
                  </FormField>
                ) : null}
                {topic === 'education-program' ? (
                  <>
                    <FormField htmlFor="contactTopicTitle" label="Тема или программа">
                      <Input autoComplete="off" id="contactTopicTitle" name="topicTitle" defaultValue={defaults.topicTitle} maxLength={180} />
                    </FormField>
                    <FormField htmlFor="contactTeamSize" label="Размер команды">
                      <Input autoComplete="off" id="contactTeamSize" name="teamSize" defaultValue={defaults.teamSize} inputMode="numeric" maxLength={80} />
                    </FormField>
                  </>
                ) : null}
                {topic === 'consulting' ? (
                  <FormField htmlFor="contactTopicTitle" label="Направление консультации">
                    <Input autoComplete="off" id="contactTopicTitle" name="topicTitle" defaultValue={defaults.topicTitle} maxLength={180} />
                  </FormField>
                ) : null}
                {topic === 'vacancy-placement' ? (
                  <>
                    <FormField htmlFor="contactPosition" label="Должность">
                      <Input autoComplete="organization-title" id="contactPosition" name="position" defaultValue={defaults.position} maxLength={160} />
                    </FormField>
                    <FormField htmlFor="contactEmploymentType" label="Формат занятости">
                      <Input autoComplete="off" id="contactEmploymentType" name="employmentType" defaultValue={defaults.employmentType} maxLength={120} placeholder="Полная занятость…" />
                    </FormField>
                    <FormField htmlFor="contactSalaryLabel" label="Оплата">
                      <Input autoComplete="off" id="contactSalaryLabel" name="salaryLabel" defaultValue={defaults.salaryLabel} maxLength={120} placeholder="По договорённости…" />
                    </FormField>
                  </>
                ) : null}
                {topic === 'supplier' ? (
                  <>
                    <FormField htmlFor="contactSupplierCategory" label="Категория">
                      <Input autoComplete="off" id="contactSupplierCategory" name="supplierCategory" defaultValue={defaults.supplierCategory} maxLength={160} />
                    </FormField>
                    <FormField htmlFor="contactServiceArea" label="Что поставляете">
                      <Input autoComplete="off" id="contactServiceArea" name="serviceArea" defaultValue={defaults.serviceArea} maxLength={160} />
                    </FormField>
                    <FormField htmlFor="contactWebsiteUrl" label="Сайт или соцсеть">
                      <Input autoComplete="url" id="contactWebsiteUrl" name="websiteUrl" defaultValue={defaults.websiteUrl} maxLength={500} type="url" />
                    </FormField>
                  </>
                ) : null}
                {topic === 'event' ? (
                  <>
                    <FormField htmlFor="contactEventTitle" label="Название события">
                      <Input autoComplete="off" id="contactEventTitle" name="eventTitle" defaultValue={defaults.eventTitle} maxLength={180} />
                    </FormField>
                    <FormField htmlFor="contactEventDate" label="Дата">
                      <Input id="contactEventDate" name="eventDate" defaultValue={defaults.eventDate} type="date" />
                    </FormField>
                    <FormField htmlFor="contactVenueName" label="Площадка">
                      <Input autoComplete="off" id="contactVenueName" name="venueName" defaultValue={defaults.venueName} maxLength={180} />
                    </FormField>
                    <FormField htmlFor="contactFormatLabel" label="Формат">
                      <Input autoComplete="off" id="contactFormatLabel" name="formatLabel" defaultValue={defaults.formatLabel} maxLength={120} placeholder="Оффлайн, онлайн, лекция…" />
                    </FormField>
                    <FormField className="md:col-span-2" htmlFor="contactRegistrationUrl" label="Ссылка на регистрацию">
                      <Input autoComplete="url" id="contactRegistrationUrl" name="registrationUrl" defaultValue={defaults.registrationUrl} maxLength={500} type="url" />
                    </FormField>
                  </>
                ) : null}
                {(topic === 'partnership' || topic === 'sponsorship') ? (
                  <>
                    <FormField htmlFor="contactPartnerType" label="Формат">
                      <Input autoComplete="off" id="contactPartnerType" name="partnerType" defaultValue={defaults.partnerType} maxLength={160} />
                    </FormField>
                    <FormField htmlFor="contactWebsiteUrl" label="Сайт или соцсеть">
                      <Input autoComplete="url" id="contactWebsiteUrl" name="websiteUrl" defaultValue={defaults.websiteUrl} maxLength={500} type="url" />
                    </FormField>
                  </>
                ) : null}
                {topic === 'article-topic' ? (
                  <>
                    <FormField htmlFor="contactTopicTitle" label="Тема или герой">
                      <Input autoComplete="off" id="contactTopicTitle" name="topicTitle" defaultValue={defaults.topicTitle} maxLength={180} />
                    </FormField>
                    <FormField htmlFor="contactFormatLabel" label="Формат">
                      <Input autoComplete="off" id="contactFormatLabel" name="formatLabel" defaultValue={defaults.formatLabel} maxLength={120} placeholder="Статья, интервью, кейс…" />
                    </FormField>
                  </>
                ) : null}
                <div className="md:col-span-2">
                  <FormField
                    htmlFor="contactMessage"
                    hint="Чем конкретнее задача, тем быстрее мы поймём, что предложить дальше."
                    label={messageLabel}
                  >
                    <Textarea id="contactMessage" name="message" required className="min-h-40" maxLength={4000} minLength={20} />
                  </FormField>
                </div>
              </div>
            </FormSection>

          <ConsentField>
            Согласен с <InlineLink href="/legal/privacy">политикой обработки персональных данных</InlineLink> и даю{' '}
            <InlineLink href="/legal/personal-data-consent">согласие на обработку персональных данных</InlineLink>, чтобы мы могли ответить на сообщение.
          </ConsentField>
        </div>
        <PublicFormShellFooter note="После отправки ответим по указанному способу связи.">
          <SubmitButton className="min-h-12 rounded-[var(--radius-md)] px-6 tracking-normal sm:self-start">
            Отправить сообщение
          </SubmitButton>
        </PublicFormShellFooter>
        {result ? (
          <PublicSubmissionFeedback
            className="mt-4"
            result={result}
            title={result.type === 'error' ? 'Не удалось отправить сообщение' : 'Заявка отправлена'}
          />
        ) : null}
      </div>
    </form>
  ) : (
    <EditorialShell className="p-5 md:p-6">
      <h3 className="text-lg font-semibold leading-7">Форма сейчас закрыта</h3>
      <p className="mt-3 text-sm leading-7 text-[var(--muted)]">
        Если вопрос срочный, напишите на email команды.
      </p>
      <Button className="mt-6 rounded-[var(--radius-md)] sm:self-start" href={`mailto:${PUBLIC_CONTACT_EMAIL}`} size="lg" variant="secondary">
        Написать на почту
      </Button>
    </EditorialShell>
  );

  return (
    <section className="relative scroll-mt-24 overflow-visible border-b border-[var(--line)] bg-[var(--surface)] py-8 md:scroll-mt-28 md:py-10" id="applications">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_24%,var(--accent-soft),transparent_18%),radial-gradient(circle_at_78%_22%,var(--surface-muted),transparent_20%)]"
      />
      <div className="container relative">
        <article className="grid gap-5 xl:grid-cols-[minmax(16rem,0.42fr)_minmax(0,1fr)] xl:items-start">
          <EditorialShell className="p-5 md:p-6" id="contact-channels">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--accent)]">Каналы связи</p>
            <h2 className="mt-3 text-2xl font-semibold leading-tight text-[var(--text)] md:text-[1.65rem]">Связь с командой</h2>
            <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
              Можно написать коротко или заполнить форму. В форме удобнее передать детали задачи.
            </p>
            <div className="mt-5 grid gap-2">
              {contactMethods.map((method) => (
                <a
                  className="group grid grid-cols-[2.625rem_minmax(0,1fr)_auto] items-center gap-3 rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[color-mix(in_oklab,var(--surface)_82%,transparent)] p-3 text-left transition-colors duration-[var(--motion-duration-base)] ease-[var(--motion-ease-standard)] hover:border-[color-mix(in_oklab,var(--accent)_32%,var(--border-default))] hover:bg-[var(--surface-wash)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] motion-reduce:transition-none"
                  href={method.href}
                  key={method.mark}
                >
                  <span
                    aria-hidden="true"
                    className="grid size-10 place-items-center rounded-[var(--radius-sm)] border border-[color-mix(in_oklab,var(--accent)_22%,var(--border-default))] bg-[var(--accent-soft)] text-[11px] font-bold tracking-[0.08em] text-[var(--accent)]"
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
            <div className="mt-4 rounded-[var(--radius-md)] border border-[color-mix(in_oklab,var(--success-text)_28%,var(--border-default))] bg-[color-mix(in_oklab,var(--success-bg)_55%,var(--surface))] px-3.5 py-3 text-sm leading-6 text-[var(--success-text)]">
              Ответ в рабочие дни. Обычно — в течение 24 часов.
            </div>
          </EditorialShell>
          <div className="min-w-0 scroll-mt-24 md:scroll-mt-28" id="contact-form">
            {form}
          </div>
        </article>
      </div>
    </section>
  );
}
