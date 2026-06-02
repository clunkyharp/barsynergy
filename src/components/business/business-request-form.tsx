'use client';

import { useState } from 'react';
import { ApplicationType } from '@prisma/client';
import { createBusinessApplication } from '@/lib/business/actions';
import { ActionRow } from '@/components/ui/action-row';
import { ConsentField } from '@/components/ui/consent-field';
import { FormField } from '@/components/ui/form-field';
import { Input } from '@/components/ui/input';
import { InlineLink } from '@/components/ui/inline-link';
import { Select } from '@/components/ui/select';
import { SegmentedControl } from '@/components/ui/segmented-control';
import { SubmitButton } from '@/components/ui/submit-button';
import { Textarea } from '@/components/ui/textarea';
import { applicationTypeLabels } from '@/lib/admin/application-utils';
import { vacancyEmploymentTypeOptions } from '@/lib/admin/content-utils';
import { vacancyPositionValues } from '@/lib/vacancies/positions';

type CityOption = {
  id: string;
  name: string;
};

type BusinessRequestFormProps = {
  cities: CityOption[];
  defaultCityId?: string | null;
};

const requestCards = [
  {
    type: ApplicationType.VACANCY_SUBMISSION,
    title: applicationTypeLabels[ApplicationType.VACANCY_SUBMISSION],
    description: 'Новая роль, условия, оплата и главное по вакансии.'
  },
  {
    type: ApplicationType.SUPPLIER_SUBMISSION,
    title: applicationTypeLabels[ApplicationType.SUPPLIER_SUBMISSION],
    description: 'Что вы поставляете, где работаете и чем полезны.'
  },
  {
    type: ApplicationType.PARTNER_APPLICATION,
    title: applicationTypeLabels[ApplicationType.PARTNER_APPLICATION],
    description: 'Совместный формат, площадка, событие или участие в проекте.'
  },
  {
    type: ApplicationType.CORPORATE_TRAINING_APPLICATION,
    title: applicationTypeLabels[ApplicationType.CORPORATE_TRAINING_APPLICATION],
    description: 'Обучение команды, задача бизнеса и состав участников.'
  },
  {
    type: ApplicationType.CERTIFICATE_ORDER,
    title: applicationTypeLabels[ApplicationType.CERTIFICATE_ORDER],
    description: 'Сертификат, сумма, получатель и пожелания по использованию.'
  }
] as const;

type BusinessRequestCardType = (typeof requestCards)[number]['type'];

const requestRequirements: Record<BusinessRequestCardType, string[]> = {
  [ApplicationType.VACANCY_SUBMISSION]: ['должность и формат занятости', 'условия оплаты или понятный ориентир', 'короткое описание роли'],
  [ApplicationType.SUPPLIER_SUBMISSION]: ['что поставляете или какую услугу оказываете', 'география работы', 'для каких заведений это подходит'],
  [ApplicationType.PARTNER_APPLICATION]: ['желаемый формат партнёрства', 'цель совместного проекта', 'ссылка на сайт или материалы, если есть'],
  [ApplicationType.CORPORATE_TRAINING_APPLICATION]: ['задача обучения', 'размер и уровень команды', 'желаемый формат или сроки'],
  [ApplicationType.CERTIFICATE_ORDER]: ['сумма или формат сертификата', 'получатель', 'пожелания по использованию']
};

export function BusinessRequestForm({ cities, defaultCityId }: BusinessRequestFormProps) {
  const [selectedType, setSelectedType] = useState<BusinessRequestCardType>(ApplicationType.VACANCY_SUBMISSION);
  const selectedRequest = requestCards.find((card) => card.type === selectedType) ?? requestCards[0];

  return (
    <section className="overflow-hidden rounded-[var(--radius-lg)] border border-[var(--line)] bg-[var(--surface-elevated)] shadow-[var(--shadow-panel)]">
      <div className="border-b border-[var(--line)] px-5 py-5 md:px-6">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--accent)]">Новая заявка</p>
        <h2 className="mt-3 text-[1.65rem] font-semibold leading-tight tracking-normal">Выберите тип заявки</h2>
      </div>
      <form action={createBusinessApplication} className="grid gap-6 p-5 md:p-6">
        <input name="type" type="hidden" value={selectedType} />

        <SegmentedControl
          className="md:grid-cols-2 xl:grid-cols-3"
          items={requestCards.map((card) => ({
            value: card.type,
            eyebrow: 'Тип заявки',
            label: card.title,
            description: card.description
          }))}
          onChange={setSelectedType}
          value={selectedType}
        />

        <div className="rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--surface-wash)] p-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--accent)]">Что подготовить</p>
          <h3 className="mt-2 text-base font-semibold leading-7 text-[var(--text)]">{selectedRequest.title}</h3>
          <ul className="mt-3 grid gap-2 text-sm leading-6 text-[var(--muted)] md:grid-cols-3">
            {requestRequirements[selectedType].map((item) => (
              <li className="grid grid-cols-[0.45rem_minmax(0,1fr)] gap-3" key={item}>
                <span className="mt-2 h-1.5 w-1.5 rounded-full bg-[var(--accent)]" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <FormField htmlFor="title" label="Короткое название">
            <Input id="title" name="title" required maxLength={180} />
          </FormField>
          <FormField htmlFor="cityId" label="Город">
            <Select id="cityId" name="cityId" defaultValue={defaultCityId ?? ''}>
              <option value="">Не выбран</option>
              {cities.map((city) => (
                <option key={city.id} value={city.id}>
                  {city.name}
                </option>
              ))}
            </Select>
          </FormField>

          {selectedType === ApplicationType.VACANCY_SUBMISSION ? (
            <>
              <FormField htmlFor="position" label="Должность">
                <Select id="position" name="position" defaultValue="">
                  <option value="">Не выбрана</option>
                  {vacancyPositionValues.map((position) => (
                    <option key={position} value={position}>
                      {position}
                    </option>
                  ))}
                </Select>
              </FormField>
              <FormField htmlFor="employmentType" label="Тип занятости">
                <Select id="employmentType" name="employmentType" defaultValue="">
                  <option value="">— Выбрать —</option>
                  {vacancyEmploymentTypeOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Select>
              </FormField>
              <FormField htmlFor="salaryLabel" label="Зарплата">
                <Input id="salaryLabel" name="salaryLabel" maxLength={120} />
              </FormField>
              <FormField htmlFor="experienceLabel" label="Опыт">
                <Input id="experienceLabel" name="experienceLabel" maxLength={120} />
              </FormField>
              <FormField className="md:col-span-2" htmlFor="shortDescription" label="Краткое описание роли">
                <Input id="shortDescription" name="shortDescription" maxLength={500} />
              </FormField>
            </>
          ) : null}

          {selectedType === ApplicationType.SUPPLIER_SUBMISSION ? (
            <>
              <FormField htmlFor="serviceArea" label="Зона поставки">
                <Input id="serviceArea" name="serviceArea" maxLength={160} />
              </FormField>
              <FormField htmlFor="shortDescription" label="Кратко о предложении">
                <Input id="shortDescription" name="shortDescription" maxLength={500} />
              </FormField>
            </>
          ) : null}

          {selectedType === ApplicationType.PARTNER_APPLICATION ? (
            <>
              <FormField htmlFor="partnerType" label="Тип партнёрства">
                <Input id="partnerType" name="partnerType" maxLength={160} />
              </FormField>
              <FormField htmlFor="shortDescription" label="Краткое описание формата">
                <Input id="shortDescription" name="shortDescription" maxLength={500} />
              </FormField>
            </>
          ) : null}

          {selectedType === ApplicationType.CORPORATE_TRAINING_APPLICATION ? (
            <>
              <FormField htmlFor="teamSize" label="Размер команды">
                <Input id="teamSize" name="teamSize" maxLength={80} />
              </FormField>
              <FormField htmlFor="shortDescription" label="Кратко о задаче обучения">
                <Input id="shortDescription" name="shortDescription" maxLength={500} />
              </FormField>
            </>
          ) : null}

          {selectedType === ApplicationType.CERTIFICATE_ORDER ? (
            <>
              <FormField htmlFor="amountLabel" label="Сумма сертификата">
                <Input id="amountLabel" name="amountLabel" maxLength={120} />
              </FormField>
              <FormField htmlFor="recipientName" label="Получатель сертификата">
                <Input id="recipientName" name="recipientName" maxLength={160} />
              </FormField>
            </>
          ) : null}
        </div>

        <FormField htmlFor="details" label="Подробности">
          <Textarea id="details" name="details" className="min-h-40" required maxLength={4000} rows={6} />
        </FormField>

        <ConsentField>
          Согласен с <InlineLink href="/legal/privacy">политикой обработки персональных данных</InlineLink> и даю{' '}
          <InlineLink href="/legal/personal-data-consent">согласие на обработку персональных данных</InlineLink> для этой заявки.
        </ConsentField>

        <ActionRow>
          <SubmitButton className="rounded-[var(--radius-md)]" size="lg" name="intent" value="submit">
            Отправить заявку
          </SubmitButton>
          <SubmitButton className="rounded-[var(--radius-md)]" size="lg" name="intent" value="draft" variant="ghost">
            Сохранить как черновик
          </SubmitButton>
        </ActionRow>
      </form>
    </section>
  );
}
