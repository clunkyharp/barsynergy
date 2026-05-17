'use client';

import { useMemo, useState } from 'react';
import { Clock, Mail, MapPin, Send, type LucideIcon } from 'lucide-react';
import { submitContactMessage } from '@/app/(public)/contacts/actions';
import {
  HiddenUtmFields,
  HoneypotField,
  ContactChannelFieldset,
  PublicFormShellFooter,
  PublicFormShellHeader,
  type PublicApplicationFormProps
} from '@/components/public/application-form-section';
import { ContactActionRow } from '@/components/public/contact-action-row';
import { RequestDisclosure } from '@/components/public/request-disclosure';
import { AppLink } from '@/components/ui/app-link';
import { Button } from '@/components/ui/button';
import { ConsentField } from '@/components/ui/consent-field';
import { EditorialShell } from '@/components/ui/editorial-shell';
import { FormField } from '@/components/ui/form-field';
import { InlineAlert } from '@/components/ui/inline-alert';
import { Input } from '@/components/ui/input';
import { InlineLink } from '@/components/ui/inline-link';
import { Select } from '@/components/ui/select';
import { SubmitButton } from '@/components/ui/submit-button';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

const contactMethods: {
  type: string;
  name: string;
  value: string;
  href?: string;
  actionLabel?: string;
  icon: LucideIcon;
}[] = [
  {
    type: 'Email',
    name: 'Основная почта',
    value: 'hello@barsynergy.ru',
    href: 'mailto:hello@barsynergy.ru',
    actionLabel: 'Написать',
    icon: Mail
  },
  {
    type: 'Telegram',
    name: 'Короткая связь',
    value: '@barsynergy',
    href: 'https://t.me/barsynergy',
    actionLabel: 'Открыть Telegram',
    icon: Send
  },
  {
    type: 'Регион',
    name: 'Город / регион',
    value: 'Махачкала, Республика Дагестан, Россия',
    icon: MapPin
  },
  {
    type: 'Ответ',
    name: 'Время ответа',
    value: 'В рабочие дни. Обычно — в течение 24 часов.',
    icon: Clock
  }
];

const contactTopicOptions = [
  {
    value: 'education-program',
    label: 'Обучение',
    description: 'Для команды, темы занятия или запроса на программу.'
  },
  {
    value: 'event',
    label: 'Событие',
    description: 'Для добавления события, участия или предложения новой встречи.'
  },
  {
    value: 'vacancy-placement',
    label: 'Вакансия',
    description: 'Для размещения роли, поиска сотрудника и получения откликов.'
  },
  {
    value: 'supplier',
    label: 'Поставщик',
    description: 'Для заявки в каталог, добавления компании или сервисной услуги.'
  },
  {
    value: 'partnership',
    label: 'Партнёрство',
    description: 'Для совместных проектов, размещения, обучения или материалов.'
  },
  {
    value: 'sponsorship',
    label: 'Спонсорство',
    description: 'Для участия бренда в сезоне, событиях или материалах.'
  },
  {
    value: 'article-topic',
    label: 'Материал или интервью',
    description: 'Для темы статьи, героя интервью, кейса или редакционного предложения.'
  },
  {
    value: 'other',
    label: 'Другое',
    description: 'Если запрос не подходит под другие темы.'
  }
] as const;

type ContactTopicValue = (typeof contactTopicOptions)[number]['value'];

function ContactTopicGrid({ selectedTopic }: { selectedTopic?: ContactTopicValue }) {
  return (
    <EditorialShell className="p-6 md:p-8">
      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--accent)]">Темы обращения</p>
      <div className="mt-5 grid gap-2 sm:grid-cols-2">
        {contactTopicOptions.map((option) => {
          const isSelected = option.value === selectedTopic;

          return (
            <AppLink
              aria-current={isSelected ? 'true' : undefined}
              aria-label={`Открыть форму: ${option.label}`}
              className={cn(
                'group grid min-h-[9.75rem] content-between rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--surface-wash)] p-4 text-left transition duration-200 hover:border-[var(--accent-muted)] hover:bg-[var(--surface-wash-strong)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)]',
                isSelected && 'border-[var(--accent-muted)] bg-[var(--surface)]'
              )}
              href={`/contacts?topic=${option.value}#contact-form`}
              key={option.value}
            >
              <span>
                <span className="block text-sm font-semibold leading-5 text-[var(--text)]">{option.label}</span>
                <span className="mt-2 block text-sm leading-6 text-[var(--muted)]">{option.description}</span>
              </span>
              <span className="mt-4 text-sm font-semibold leading-5 text-[var(--accent)]">Открыть форму</span>
            </AppLink>
          );
        })}
      </div>
    </EditorialShell>
  );
}

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
          ? 'Что важно знать о событии'
          : topic === 'partnership'
            ? 'Какой формат партнёрства хотите обсудить'
            : topic === 'sponsorship'
              ? 'Какие условия спонсорства нужны'
              : topic === 'article-topic'
                ? 'О чём должен быть материал'
                : topic === 'education-program'
                  ? 'Что нужно по обучению'
                  : 'Сообщение';

  const form = enabled ? (
      <form action={submitContactMessage} className="editorial-form-shell">
        <HiddenUtmFields utm={utm} />
        <HoneypotField id="contact-message-website" />
        <PublicFormShellHeader
          eyebrow="Сообщение"
          title="О чём хотите написать"
          description="Коротко опишите вопрос, задачу или идею."
        />
        <div className="relative p-5 md:p-6">
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
            <div className="md:col-span-2">
              <p className="rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--surface-wash)] px-4 py-3 text-sm leading-6 text-[var(--muted)]">
                {selectedTopic.description}
              </p>
            </div>
            <ContactChannelFieldset className="md:col-span-2" emailId="contactEmail" phoneId="contactPhone" telegramId="contactTelegram" />
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
              topic === 'sponsorship') ? (
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
                hint="Чем конкретнее задача, тем быстрее команда поймёт, что вам предложить дальше."
                label={messageLabel}
              >
                <Textarea id="contactMessage" name="message" required className="min-h-40" maxLength={4000} minLength={20} />
              </FormField>
            </div>
            <div className="md:col-span-2">
              <ConsentField>
                Согласен с <InlineLink href="/legal/privacy">политикой обработки персональных данных</InlineLink> и даю{' '}
                <InlineLink href="/legal/personal-data-consent">согласие на обработку персональных данных</InlineLink>, чтобы команда могла ответить на сообщение.
              </ConsentField>
            </div>
          </div>
          <PublicFormShellFooter note="После отправки команда ответит по указанному способу связи.">
            <SubmitButton className="min-h-12 rounded-[var(--radius-md)] px-6 tracking-normal sm:self-start">
              Отправить сообщение
            </SubmitButton>
          </PublicFormShellFooter>
        </div>
      </form>
  ) : (
    <EditorialShell className="p-5 md:p-6">
      <h3 className="text-lg font-semibold leading-7">Форма сейчас закрыта</h3>
      <p className="mt-3 text-sm leading-7 text-[var(--muted)]">
        Если вопрос срочный, напишите на email команды.
      </p>
      <Button className="mt-6 rounded-[var(--radius-md)] sm:self-start" href="mailto:hello@barsynergy.ru" size="lg" variant="secondary">
        Написать на почту
      </Button>
    </EditorialShell>
  );

  return (
    <section className="relative overflow-visible border-b border-[var(--line)] bg-[var(--surface)] py-14 md:py-18" id="applications">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_24%,var(--accent-soft),transparent_18%),radial-gradient(circle_at_78%_22%,var(--surface-muted),transparent_20%)]"
      />
      <div className="container relative grid gap-6">
        <div className="grid gap-5 xl:grid-cols-[0.82fr_1.18fr] xl:items-start">
          <EditorialShell className="p-6 md:p-8">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--accent)]">Контакты</p>
            <div className="mt-5 grid gap-2">
              {contactMethods.map((method) => (
                <ContactActionRow
                  actionLabel={method.actionLabel}
                  descriptor={method.value}
                  href={method.href}
                  icon={method.icon}
                  key={method.type}
                  serviceName={method.name}
                  typeLabel={method.type}
                  wrapDescriptor
                />
              ))}
            </div>
            {result ? (
              <InlineAlert className="mt-8" tone={result.type === 'error' ? 'error' : 'success'}>
                {result.message}
              </InlineAlert>
            ) : null}
          </EditorialShell>
          <ContactTopicGrid selectedTopic={hasDefaultTopic ? topic : undefined} />
        </div>
        <RequestDisclosure
          aliases={['applications']}
          defaultOpen={Boolean(result)}
          focusSelector="#contactName"
          id="contact-form"
          openLabel="Открыть форму"
          title="Форма сообщения"
          description="Выберите тему, оставьте контакт и коротко опишите задачу."
        >
          {form}
        </RequestDisclosure>
      </div>
    </section>
  );
}
