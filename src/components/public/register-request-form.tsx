'use client';

import { useState } from 'react';
import { createBusinessAccountRequestAction } from '@/app/auth/actions';
import { ActionRow } from '@/components/ui/action-row';
import { Button } from '@/components/ui/button';
import { ConsentField } from '@/components/ui/consent-field';
import { FormField, FormSection } from '@/components/ui/form-field';
import { Input } from '@/components/ui/input';
import { InlineLink } from '@/components/ui/inline-link';
import { Select } from '@/components/ui/select';
import { SubmitButton } from '@/components/ui/submit-button';
import { Textarea } from '@/components/ui/textarea';
import { PublicFormValidation } from '@/components/public/public-form-validation';

type RegisterRequestFormProps = {
  cities: Array<{ id: string; name: string }>;
};

type RegisterRole = 'participant' | 'business';

export function RegisterRequestForm({ cities }: RegisterRequestFormProps) {
  const [step, setStep] = useState<1 | 2>(1);
  const [email, setEmail] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [role, setRole] = useState<RegisterRole>('business');

  return (
    <form action={createBusinessAccountRequestAction} className="auth-register-form public-form-shell grid gap-6" noValidate>
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
        <FormSection title="Шаг 1. Доступ">
          <div className="grid gap-4 md:grid-cols-2">
            <FormField htmlFor="registerEmail" label="Email">
              <Input
                autoComplete="email"
                id="registerEmail"
                onChange={(event) => setEmail(event.target.value)}
                required
                type="email"
                value={email}
              />
            </FormField>
            <FormField htmlFor="registerContactPerson" label="Имя">
              <Input
                autoComplete="name"
                id="registerContactPerson"
                maxLength={120}
                minLength={2}
                onChange={(event) => setContactPerson(event.target.value)}
                required
                value={contactPerson}
              />
            </FormField>
          </div>
          <fieldset className="mt-4 grid gap-2">
            <legend className="text-[13px] font-medium leading-[18px] text-[var(--text)]">Роль</legend>
            <div className="grid gap-2 md:grid-cols-2">
              {[
                { value: 'participant', label: 'Я работаю в баре' },
                { value: 'business', label: 'Я владею заведением или представляю бренд' }
              ].map((option) => (
                <label
                  className="flex min-h-12 items-center gap-3 rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--surface)] px-4 py-3 text-sm font-semibold text-[var(--text)] has-[:checked]:border-[var(--accent)]/40 has-[:checked]:bg-[var(--accent-soft)]"
                  key={option.value}
                >
                  <input
                    checked={role === option.value}
                    className="accent-[var(--accent)]"
                    onChange={() => setRole(option.value as RegisterRole)}
                    type="radio"
                    value={option.value}
                  />
                  {option.label}
                </label>
              ))}
            </div>
          </fieldset>
          <ActionRow align="between">
            <p className="max-w-md text-xs leading-6 text-[var(--muted)]">
              На первом шаге нужен только контакт для ответа.
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
          <input name="role" type="hidden" value={role} />
          <FormSection title="Шаг 2. Компания">
            <div className="grid gap-4 md:grid-cols-2">
              <FormField htmlFor="companyName" label="Компания">
                <Input id="companyName" name="companyName" required maxLength={160} />
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
                <Input id="phone" name="phone" maxLength={80} />
              </FormField>
              <FormField htmlFor="telegram" label="Telegram">
                <Input id="telegram" name="telegram" maxLength={80} />
              </FormField>
              <FormField htmlFor="websiteUrl" label="Сайт">
                <Input id="websiteUrl" name="websiteUrl" type="url" maxLength={240} />
              </FormField>
            </div>
          </FormSection>

          <FormSection title="Комментарий">
            <FormField htmlFor="description" label="Коротко о запросе">
              <Textarea id="description" name="description" className="min-h-32" maxLength={1000} rows={4} />
            </FormField>
          </FormSection>

          <ConsentField>
            <span>
              Согласен с <InlineLink href="/legal/privacy">политикой обработки персональных данных</InlineLink> и даю{' '}
              <InlineLink href="/legal/personal-data-consent">согласие на обработку персональных данных</InlineLink> для рассмотрения заявки.
            </span>
          </ConsentField>
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
