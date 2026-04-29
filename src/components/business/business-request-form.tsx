'use client';

import { useMemo, useState } from 'react';
import { ApplicationType } from '@prisma/client';
import { createBusinessApplication } from '@/app/business/actions';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { FormField } from '@/components/ui/form-field';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { applicationTypeLabels } from '@/lib/admin/application-utils';
import { vacancyPositionValues } from '@/lib/vacancies/positions';
import { cn } from '@/lib/utils';

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
    description: 'Новая роль, условия, оплата и контекст вакансии.'
  },
  {
    type: ApplicationType.SUPPLIER_SUBMISSION,
    title: applicationTypeLabels[ApplicationType.SUPPLIER_SUBMISSION],
    description: 'Каталог поставщика, зона работы и ключевое предложение.'
  },
  {
    type: ApplicationType.PARTNER_APPLICATION,
    title: applicationTypeLabels[ApplicationType.PARTNER_APPLICATION],
    description: 'Совместный формат, площадка, коллаборация или участие в проекте.'
  },
  {
    type: ApplicationType.CORPORATE_TRAINING_APPLICATION,
    title: applicationTypeLabels[ApplicationType.CORPORATE_TRAINING_APPLICATION],
    description: 'Обучение команды, задачи бизнеса и состав участников.'
  },
  {
    type: ApplicationType.CERTIFICATE_ORDER,
    title: applicationTypeLabels[ApplicationType.CERTIFICATE_ORDER],
    description: 'Сертификат, сумма, получатель и рабочий сценарий использования.'
  }
] as const;

type BusinessRequestCardType = (typeof requestCards)[number]['type'];

const typeNotes: Record<BusinessRequestCardType, { title: string; helper: string }> = {
  [ApplicationType.VACANCY_SUBMISSION]: {
    title: 'Нужны данные по роли',
    helper: 'Покажем только поля, которые нужны для публикации вакансии и первичного отбора.'
  },
  [ApplicationType.SUPPLIER_SUBMISSION]: {
    title: 'Нужны данные по поставке',
    helper: 'Оставьте описание поставщика, географию работы и короткую суть предложения.'
  },
  [ApplicationType.PARTNER_APPLICATION]: {
    title: 'Нужен формат партнерства',
    helper: 'Соберите задачу, тип сотрудничества и краткое описание формата.'
  },
  [ApplicationType.CORPORATE_TRAINING_APPLICATION]: {
    title: 'Нужен запрос на обучение',
    helper: 'Команда, задача и детали формата важнее длинного общего описания.'
  },
  [ApplicationType.CERTIFICATE_ORDER]: {
    title: 'Нужны параметры сертификата',
    helper: 'Сумма, получатель и сценарий использования позволят быстрее взять заявку в работу.'
  }
};

export function BusinessRequestForm({ cities, defaultCityId }: BusinessRequestFormProps) {
  const [selectedType, setSelectedType] = useState<BusinessRequestCardType>(ApplicationType.VACANCY_SUBMISSION);
  const note = useMemo(() => typeNotes[selectedType], [selectedType]);

  return (
    <Card className="overflow-hidden p-0">
      <div className="border-b border-black/10 px-5 py-5 md:px-6">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--accent)]">Новая заявка</p>
        <h2 className="mt-3 text-2xl font-semibold tracking-[-0.03em]">Сначала выберите рабочий сценарий</h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--muted)]">
          Форма покажет только те поля, которые нужны для выбранного типа заявки.
        </p>
      </div>
      <form action={createBusinessApplication} className="grid gap-6 p-5 md:p-6">
        <input name="type" type="hidden" value={selectedType} />

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {requestCards.map((card) => (
            <button
              className={cn(
                'rounded-[1.35rem] border px-4 py-4 text-left transition',
                selectedType === card.type
                  ? 'border-[var(--graphite)] bg-[var(--graphite)] text-white'
                  : 'border-black/10 bg-[var(--surface)] hover:border-[var(--accent)] hover:bg-white'
              )}
              key={card.type}
              onClick={() => setSelectedType(card.type)}
              type="button"
            >
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] opacity-70">Тип заявки</p>
              <p className="mt-2 text-base font-semibold leading-6">{card.title}</p>
              <p className={cn('mt-2 text-sm leading-6', selectedType === card.type ? 'text-white/72' : 'text-[var(--muted)]')}>
                {card.description}
              </p>
            </button>
          ))}
        </div>

        <div className="rounded-[1.35rem] border border-black/10 bg-[var(--surface)] px-4 py-4 text-sm leading-6 text-[var(--muted)]">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--accent)]">{note.title}</p>
          <p className="mt-2">{note.helper}</p>
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

        <label className="grid grid-cols-[1.25rem_minmax(0,1fr)] items-start gap-3.5 rounded-[1.15rem] border border-black/10 bg-[rgba(255,255,255,0.6)] px-4 py-4 text-sm leading-6 text-[var(--muted)]">
          <Checkbox name="consent" required value="accepted" />
          <span>Подтверждаю согласие на обработку данных заявки.</span>
        </label>

        <div className="flex flex-col gap-3 border-t border-black/10 pt-5 sm:flex-row">
          <Button className="rounded-full" type="submit" name="intent" value="submit">
            Отправить заявку
          </Button>
          <Button className="rounded-full" type="submit" name="intent" value="draft" variant="secondary">
            Сохранить позже
          </Button>
        </div>
      </form>
    </Card>
  );
}
