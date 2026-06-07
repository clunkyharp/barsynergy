'use client';

import { useState } from 'react';
import { ActionRow } from '@/components/ui/action-row';
import { Button } from '@/components/ui/button';
import { ConsentField } from '@/components/ui/consent-field';
import { FormField, FormSection } from '@/components/ui/form-field';
import { Input } from '@/components/ui/input';
import { InlineLink } from '@/components/ui/inline-link';
import { Select } from '@/components/ui/select';
import { SubmitButton } from '@/components/ui/submit-button';
import { Textarea } from '@/components/ui/textarea';
import { Turnstile } from '@/components/ui/turnstile';
import { PublicFormValidation } from '@/components/public/public-form-validation';

type BusinessRequestFormProps = {
  cities: Array<{ id: string; name: string }>;
  action: (formData: FormData) => void;
};

export function BusinessRequestForm({ cities, action }: BusinessRequestFormProps) {
  const [step, setStep] = useState<1 | 2>(1);
  const [email, setEmail] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [turnstileToken, setTurnstileToken] = useState('');

  return (
    <form action={action} className="auth-business-request-form public-form-shell grid gap-6" noValidate>
      <PublicFormValidation />
      <div className="flex flex-wrap gap-2 border-b border-[var(--line)] pb-4">
        {[
          { value: 1, label: 'Шаг 1', text: 'Контакт' },
          { value: 2, label: 'Шаг 2', text: 'Компания' }
        ].map((item) => (
          <span
            aria-current={step === item.value ? 'step' : undefined}
            className="rounded-[var(--radius-sm)] border border-[var(--border-default)] bg-[var(--surface-wash)] px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--muted)] aria-current:border-[var(--accent)]/35 aria-current:bg-[var(--accent-soft)] aria-current:text-[var(--accent)]"
            key={item.value}
          >
            {item.label}: {item.text}
          </span>
        ))}
      </div>

      {step === 1 ? (
        <FormSection title="Шаг 1. Контакт">
          <div className="grid gap-4 md:grid-cols-2">
            <FormField htmlFor="registerEmail" label="Email">
              <Input
                autoComplete="email"
                id="registerEmail"
                onChange={(event) => setEmail(event.target.value)}
                placeholder="name@example.com"
                required
                type="email"
                value={email}
              />
            </FormField>
            <FormField htmlFor="registerContactPerson" label="Контактное лицо">
              <Input
                autoComplete="name"
                id="registerContactPerson"
                maxLength={120}
                minLength={2}
                onChange={(event) => setContactPerson(event.target.value)}
                placeholder="Иван Иванов"
                required
                value={contactPerson}
              />
            </FormField>
          </div>
          <ActionRow align="between">
            <p className="max-w-md text-xs leading-6 text-[var(--muted)]">
              На первом шаге нужен контакт для ответа.
            </p>
            <Button
              className="rounded-[var(--radius-md)]"
              disabled={!email.trim() || !contactPerson.trim()}
              onClick={() => setStep(2)}
              size="lg"
              type="button"
            >
              Продолжить
            </Button>
          </ActionRow>
        </FormSection>
      ) : (
        <>
          <input name="email" type="hidden" value={email} />
          <input name="contactPerson" type="hidden" value={contactPerson} />
          <FormSection title="Шаг 2. Компания">
            <div className="grid gap-4 md:grid-cols-2">
              <FormField htmlFor="companyName" label="Компания">
                <Input id="companyName" name="companyName" required maxLength={160} placeholder="Например, Coffee Point" />
              </FormField>
              <FormField htmlFor="cityId" label="Город">
                <Select id="cityId" name="cityId">
                  <option value="">Не выбран</option>
                  {cities.map((city) => (
                    <option key={city.id} value={city.id}>
                      {city.name}
                    </option>
                  ))}
                </Select>
              </FormField>
            </div>
          </FormSection>

          <FormSection title="Контакты">
            <div className="grid gap-4 md:grid-cols-2">
              <FormField htmlFor="phone" label="Телефон">
                <Input id="phone" name="phone" maxLength={80} placeholder="+7 999 123 45 67" />
              </FormField>
              <FormField htmlFor="telegram" label="Telegram">
                <Input id="telegram" name="telegram" maxLength={80} placeholder="@username" />
              </FormField>
              <FormField htmlFor="websiteUrl" label="Сайт">
                <Input id="websiteUrl" name="websiteUrl" type="url" placeholder="https://example.ru" maxLength={240} />
              </FormField>
            </div>
          </FormSection>

          <FormSection title="Комментарий">
            <FormField htmlFor="description" label="Коротко о запросе">
              <Textarea id="description" name="description" className="min-h-32" maxLength={1000} rows={4} placeholder="Например: нужно открыть кабинет компании для размещения вакансий и работы с откликами." />
            </FormField>
          </FormSection>

          <ConsentField>
            <span>
              Согласен с <InlineLink href="/legal/privacy">политикой обработки персональных данных</InlineLink> и даю{' '}
              <InlineLink href="/legal/personal-data-consent">согласие на обработку персональных данных</InlineLink> для рассмотрения заявки на бизнес-доступ.
            </span>
          </ConsentField>
          <input name="turnstileToken" type="hidden" value={turnstileToken} />
          <Turnstile onVerify={setTurnstileToken} />
          <ActionRow align="between">
            <Button className="rounded-[var(--radius-md)]" onClick={() => setStep(1)} size="lg" type="button" variant="secondary">
              Назад
            </Button>
            <SubmitButton className="rounded-[var(--radius-md)]" size="lg">
              Отправить заявку
            </SubmitButton>
          </ActionRow>
        </>
      )}
    </form>
  );
}
