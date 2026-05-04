'use client';

import { useMemo, useState } from 'react';
import { Clock, Mail, MapPin, Send } from 'lucide-react';
import { submitContactMessage } from '@/app/(public)/contacts/actions';
import {
  HiddenUtmFields,
  HoneypotField,
  ContactChannelFieldset,
  PublicFormShellFooter,
  PublicFormShellHeader,
  type PublicApplicationFormProps
} from '@/components/public/application-form-section';
import { IconBadge } from '@/components/public/public-ui-adaptation';
import { Button } from '@/components/ui/button';
import { ConsentField } from '@/components/ui/consent-field';
import { EditorialShell } from '@/components/ui/editorial-shell';
import { FormField } from '@/components/ui/form-field';
import { InlineAlert } from '@/components/ui/inline-alert';
import { Input } from '@/components/ui/input';
import { InlineLink } from '@/components/ui/inline-link';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

const contactTopicOptions = [
  {
    value: 'education-program',
    label: 'Обучение',
    description: 'Для команды, новой темы, запуска программы или учебного запроса.'
  },
  {
    value: 'event',
    label: 'Событие',
    description: 'Для добавления события, участия, коллаборации или предложения новой встречи.'
  },
  {
    value: 'vacancy-placement',
    label: 'Вакансия',
    description: 'Для размещения роли, поиска сотрудника и сбора первых откликов.'
  },
  {
    value: 'supplier',
    label: 'Поставщик',
    description: 'Для заявки в каталог, добавления компании или сервисной команды.'
  },
  {
    value: 'partnership',
    label: 'Партнёрство',
    description: 'Для совместных проектов, размещения, образовательных и редакционных форматов.'
  },
  {
    value: 'sponsorship',
    label: 'Спонсорство',
    description: 'Для сезонного присутствия, партнёрства в событиях и брендовых интеграций.'
  },
  {
    value: 'article-topic',
    label: 'Материал или интервью',
    description: 'Для темы статьи, героя интервью, кейса или редакционного предложения.'
  },
  {
    value: 'other',
    label: 'Другое',
    description: 'Если запрос не подходит под готовые сценарии.'
  }
] as const;

type ContactTopicValue = (typeof contactTopicOptions)[number]['value'];

export function ContactApplicationForm({ enabled, result, utm, cities, defaultTopic, defaults = {} }: PublicApplicationFormProps) {
  const initialTopic = contactTopicOptions.some((option) => option.value === defaultTopic)
    ? (defaultTopic as ContactTopicValue)
    : 'other';
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
              ? 'Какую задачу должно решить спонсорство'
              : topic === 'article-topic'
                ? 'О чём должен быть материал'
                : topic === 'education-program'
                  ? 'Что нужно по обучению'
                  : 'Сообщение';

  const form = enabled ? (
      <form action={submitContactMessage} className="editorial-form-shell overflow-hidden">
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
          <PublicFormShellFooter note="Форма подстраивается под тему. Ответ придёт по указанному способу связи.">
            <Button className="min-h-12 rounded-[var(--radius-md)] px-6 tracking-normal sm:self-start" type="submit">
              Отправить сообщение
            </Button>
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
    <section className="relative overflow-hidden border-b border-[var(--line)] bg-[var(--surface)] py-14 md:py-18" id="applications">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_24%,var(--accent-soft),transparent_18%),radial-gradient(circle_at_78%_22%,var(--surface-muted),transparent_20%)]"
      />
      <div className="container relative grid gap-6 xl:grid-cols-[0.72fr_1.28fr] xl:items-start">
        <div className="grid gap-5">
          <EditorialShell className="p-6 md:p-8">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--accent)]">Контакты</p>
            <div className="mt-7 grid gap-6">
              <div className="grid grid-cols-[auto_minmax(0,1fr)] gap-4">
                <IconBadge icon={Mail} size="md" tone="soft" />
                <div>
                  <h3 className="text-lg font-semibold leading-7 text-[var(--text)]">Email</h3>
                  <a className="mt-1 block text-sm font-semibold text-[var(--accent)]" href="mailto:hello@barsynergy.ru">
                    hello@barsynergy.ru
                  </a>
                </div>
              </div>
              <div className="grid grid-cols-[auto_minmax(0,1fr)] gap-4">
                <IconBadge icon={Send} size="md" tone="soft" />
                <div>
                  <h3 className="text-lg font-semibold leading-7 text-[var(--text)]">Telegram</h3>
                  <a className="mt-1 block text-sm font-semibold text-[var(--accent)]" href="https://t.me/barsynergy">
                    @barsynergy
                  </a>
                </div>
              </div>
              <div className="grid grid-cols-[auto_minmax(0,1fr)] gap-4">
                <IconBadge icon={MapPin} size="md" tone="soft" />
                <div>
                  <h3 className="text-lg font-semibold leading-7 text-[var(--text)]">Город / регион</h3>
                  <p className="mt-1 text-sm leading-6 text-[var(--muted)]">Махачкала, Республика Дагестан, Россия</p>
                </div>
              </div>
              <div className="grid grid-cols-[auto_minmax(0,1fr)] gap-4">
                <IconBadge icon={Clock} size="md" tone="soft" />
                <div>
                  <h3 className="text-lg font-semibold leading-7 text-[var(--text)]">Время ответа</h3>
                  <p className="mt-1 text-sm leading-6 text-[var(--muted)]">В рабочие дни. Обычно — в течение 24 часов.</p>
                </div>
              </div>
            </div>
            {result ? (
              <InlineAlert className="mt-8" tone={result.type === 'error' ? 'error' : 'success'}>
                {result.message}
              </InlineAlert>
            ) : null}
          </EditorialShell>
        </div>
        {form}
      </div>
    </section>
  );
}
