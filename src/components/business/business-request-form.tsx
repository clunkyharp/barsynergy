'use client';

import { useState } from 'react';
import { ApplicationType } from '@prisma/client';
import { createBusinessApplication } from '@/app/business/actions';
import { ActionRow } from '@/components/ui/action-row';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ConsentField } from '@/components/ui/consent-field';
import { FormField } from '@/components/ui/form-field';
import { Input } from '@/components/ui/input';
import { InlineLink } from '@/components/ui/inline-link';
import { Select } from '@/components/ui/select';
import { SegmentedControl } from '@/components/ui/segmented-control';
import { Textarea } from '@/components/ui/textarea';
import { applicationTypeLabels } from '@/lib/admin/application-utils';
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
    description: 'Совместный формат, площадка, коллаборация или участие в проекте.'
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

export function BusinessRequestForm({ cities, defaultCityId }: BusinessRequestFormProps) {
  const [selectedType, setSelectedType] = useState<BusinessRequestCardType>(ApplicationType.VACANCY_SUBMISSION);

  return (
    <Card className="overflow-hidden p-0">
      <div className="border-b border-black/10 px-5 py-5 md:px-6">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--accent)]">Новая заявка</p>
        <h2 className="mt-3 text-2xl font-semibold tracking-[-0.03em]">Выберите тип заявки</h2>
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
                <Input id="employmentType" name="employmentType" maxLength={100} />
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
              <FormField htmlFor="partnerType" label="Тип партнерства">
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
          <Button className="rounded-full" size="lg" type="submit" name="intent" value="submit">
            Отправить заявку
          </Button>
          <Button className="rounded-full" size="lg" type="submit" name="intent" value="draft" variant="secondary">
            Сохранить как черновик
          </Button>
        </ActionRow>
      </form>
    </Card>
  );
}
