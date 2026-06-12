'use client';

import { useState } from 'react';
import { ApplicationType } from '@prisma/client';
import { Briefcase, Building2, GraduationCap, Handshake, Truck } from 'lucide-react';
import { ActionRow } from '@/components/ui/action-row';
import { ConsentField } from '@/components/ui/consent-field';
import { FormField } from '@/components/ui/form-field';
import { Input } from '@/components/ui/input';
import { InlineLink } from '@/components/ui/inline-link';
import { Select } from '@/components/ui/select';
import { SubmitButton } from '@/components/ui/submit-button';
import { Textarea } from '@/components/ui/textarea';
import { applicationTypeLabels, vacancyEmploymentTypeOptions } from '@/modules/content/shared/labels';
import { vacancyPositionValues } from '@/lib/vacancies/positions';
import { cn } from '@/lib/utils';

type CityOption = {
  id: string;
  name: string;
};

type BusinessRequestFormProps = {
  cities: CityOption[];
  defaultCityId?: string | null;
  action: (formData: FormData) => void | Promise<void>;
};

const requestCards = [
  {
    type: ApplicationType.VACANCY_SUBMISSION,
    title: applicationTypeLabels[ApplicationType.VACANCY_SUBMISSION],
    description: 'Новая роль, условия и оплата.',
    icon: Briefcase
  },
  {
    type: ApplicationType.SUPPLIER_SUBMISSION,
    title: applicationTypeLabels[ApplicationType.SUPPLIER_SUBMISSION],
    description: 'Что поставляете, где работаете.',
    icon: Truck
  },
  {
    type: ApplicationType.PARTNER_APPLICATION,
    title: applicationTypeLabels[ApplicationType.PARTNER_APPLICATION],
    description: 'Совместный формат или событие.',
    icon: Handshake
  },
  {
    type: ApplicationType.CORPORATE_TRAINING_APPLICATION,
    title: applicationTypeLabels[ApplicationType.CORPORATE_TRAINING_APPLICATION],
    description: 'Обучение команды и задача бизнеса.',
    icon: GraduationCap
  },
  {
    type: ApplicationType.CERTIFICATE_ORDER,
    title: applicationTypeLabels[ApplicationType.CERTIFICATE_ORDER],
    description: 'Сертификат и получатель.',
    icon: Building2
  }
];

type BusinessRequestCardType = typeof requestCards[number]['type'];

const requestRequirements: Record<BusinessRequestCardType, string[]> = {
  [ApplicationType.VACANCY_SUBMISSION]: ['должность и формат занятости', 'условия оплаты или ориентир', 'короткое описание роли'],
  [ApplicationType.SUPPLIER_SUBMISSION]: ['что поставляете или услуга', 'география работы', 'для каких заведений подходит'],
  [ApplicationType.PARTNER_APPLICATION]: ['желаемый формат партнёрства', 'цель совместного проекта', 'ссылка на материалы (если есть)'],
  [ApplicationType.CORPORATE_TRAINING_APPLICATION]: ['задача обучения', 'размер и уровень команды', 'желаемый формат или сроки'],
  [ApplicationType.CERTIFICATE_ORDER]: ['сумма или формат сертификата', 'получатель', 'пожелания по использованию']
};

export function BusinessRequestForm({ cities, defaultCityId, action }: BusinessRequestFormProps) {
  const [selectedType, setSelectedType] = useState<BusinessRequestCardType>(ApplicationType.VACANCY_SUBMISSION);
  const selectedRequest = requestCards.find((card) => card.type === selectedType) ?? requestCards[0];

  const cardTypeConfig = {
    [ApplicationType.VACANCY_SUBMISSION]: 'vacancy' as const,
    [ApplicationType.SUPPLIER_SUBMISSION]: 'supplier' as const,
    [ApplicationType.PARTNER_APPLICATION]: 'partner' as const,
    [ApplicationType.CORPORATE_TRAINING_APPLICATION]: 'training' as const,
    [ApplicationType.CERTIFICATE_ORDER]: 'certificate' as const,
  };

  const selectedCardType = cardTypeConfig[selectedType];

  function handleRadioKeyDown(event: React.KeyboardEvent, currentType: BusinessRequestCardType) {
    const currentIndex = requestCards.findIndex((c) => c.type === currentType);
    let nextIndex = currentIndex;

    switch (event.key) {
      case 'ArrowDown':
      case 'ArrowRight':
        event.preventDefault();
        nextIndex = (currentIndex + 1) % requestCards.length;
        break;
      case 'ArrowUp':
      case 'ArrowLeft':
        event.preventDefault();
        nextIndex = (currentIndex - 1 + requestCards.length) % requestCards.length;
        break;
      default:
        return;
    }

    if (nextIndex !== currentIndex) {
      setSelectedType(requestCards[nextIndex].type);
    }
  }

  return (
    <section className="overflow-hidden rounded-[var(--radius-lg)] border border-[var(--line)] bg-[var(--surface-elevated)] shadow-[var(--shadow-panel)]">
      <div className="border-b border-[var(--line)] px-5 py-5 md:px-6">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--accent)]">Новая заявка</p>
        <h2 className="mt-3 text-[1.65rem] font-semibold leading-tight tracking-normal">Выберите тип заявки</h2>
      </div>
      <form action={action} className="grid gap-6 p-5 md:p-6">
        <input name="type" type="hidden" value={selectedType} />

        <div className="grid gap-2 sm:grid-cols-2" role="radiogroup" aria-label="Тип заявки">
          {requestCards.map((card) => {
            const Icon = card.icon;
            const selected = card.type === selectedType;
            return (
              <button
                aria-checked={selected}
                className={cn(
                  'flex items-start gap-3 rounded-[var(--radius-md)] border px-4 py-3 text-left transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]',
                  selected
                    ? 'border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--text)]'
                    : 'border-[var(--line)] bg-[var(--surface)] text-[var(--text)] hover:border-[var(--border-hover)] hover:bg-[var(--surface-wash)]'
                )}
                key={card.type}
                onClick={() => setSelectedType(card.type)}
                onKeyDown={(e) => handleRadioKeyDown(e, card.type)}
                role="radio"
                type="button"
              >
                <span
                  aria-hidden
                  className={cn(
                    'inline-grid size-9 shrink-0 place-items-center rounded-[var(--radius-sm)]',
                    selected ? 'bg-[var(--accent)] text-[var(--accent-on)]' : 'bg-[var(--surface-wash)] text-[var(--muted)]'
                  )}
                >
                  <Icon size={18} strokeWidth={1.8} />
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-semibold leading-5">{card.title}</span>
                  <span className="mt-0.5 block text-xs leading-5 text-[var(--muted)]">{card.description}</span>
                </span>
              </button>
            );
          })}
        </div>

        <div className="rounded-[var(--radius-md)] border border-[var(--line)] bg-[var(--surface-wash)] p-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
            Что подготовить · {selectedRequest.title}
          </p>
          <ul className="mt-3 grid gap-2 text-sm leading-6 text-[var(--text)]">
            {requestRequirements[selectedType].map((item) => (
              <li className="flex items-start gap-2" key={item}>
                <span aria-hidden className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--accent)]" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <FormField htmlFor="title" label="Короткое название">
            <Input id="title" name="title" required minLength={2} maxLength={180} placeholder="Например, Бариста в утреннюю смену" />
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

          {selectedCardType === 'vacancy' ? (
            <>
              <FormField htmlFor="position" label="Должность">
                <Select id="position" name="position" required defaultValue="">
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
                <Input id="salaryLabel" name="salaryLabel" maxLength={120} placeholder="Например, 80 000 + бонусы" />
              </FormField>
              <FormField htmlFor="experienceLabel" label="Опыт">
                <Input id="experienceLabel" name="experienceLabel" maxLength={120} placeholder="Например, от 1 года" />
              </FormField>
              <FormField className="md:col-span-2" htmlFor="shortDescription" label="Краткое описание роли">
                <Input id="shortDescription" name="shortDescription" required minLength={10} maxLength={500} placeholder="Например, работа с гостями, классика и открытие смены." />
              </FormField>
            </>
          ) : null}

          {selectedCardType === 'supplier' ? (
            <>
              <FormField htmlFor="serviceArea" label="Зона поставки">
                <Input id="serviceArea" name="serviceArea" required minLength={2} maxLength={160} placeholder="Например, СКФО и ЮФО" />
              </FormField>
              <FormField htmlFor="shortDescription" label="Кратко о предложении">
                <Input id="shortDescription" name="shortDescription" maxLength={500} placeholder="Например, поставляем зерно и расходники для кофеен." />
              </FormField>
            </>
          ) : null}

          {selectedCardType === 'partner' ? (
            <>
              <FormField htmlFor="partnerType" label="Тип партнёрства">
                <Input id="partnerType" name="partnerType" required minLength={2} maxLength={160} placeholder="Например, совместное событие" />
              </FormField>
              <FormField htmlFor="shortDescription" label="Краткое описание формата">
                <Input id="shortDescription" name="shortDescription" maxLength={500} placeholder="Например, хотим провести серию дегустаций для заведений." />
              </FormField>
            </>
          ) : null}

          {selectedCardType === 'training' ? (
            <>
              <FormField htmlFor="teamSize" label="Размер команды">
                <Input id="teamSize" name="teamSize" required minLength={1} maxLength={80} placeholder="Например, 12 человек" />
              </FormField>
              <FormField htmlFor="shortDescription" label="Кратко о задаче обучения">
                <Input id="shortDescription" name="shortDescription" maxLength={500} placeholder="Например, нужно подтянуть сервис и работу в час пик." />
              </FormField>
            </>
          ) : null}

          {selectedCardType === 'certificate' ? (
            <>
              <FormField htmlFor="amountLabel" label="Сумма сертификата">
                <Input id="amountLabel" name="amountLabel" required minLength={1} maxLength={120} placeholder="Например, 3000 рублей" />
              </FormField>
              <FormField htmlFor="recipientName" label="Получатель сертификата">
                <Input id="recipientName" name="recipientName" required minLength={2} maxLength={160} placeholder="Мария Петрова" />
              </FormField>
            </>
          ) : null}
        </div>

        <FormField htmlFor="details" label="Подробности">
          <Textarea id="details" name="details" className="min-h-40" required minLength={10} maxLength={4000} rows={6} placeholder="Например: нужны 2 бариста на сменный график, старт в июле, важен опыт работы с потоком и сервисом." />
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
