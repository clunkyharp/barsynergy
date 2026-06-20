'use client';

import { useActionState, useState } from 'react';
import { CheckCircle } from 'lucide-react';
import { FormField } from '@/components/ui/form-field';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { SubmitButton } from '@/components/ui/submit-button';
import { PublicFormValidation } from '@/components/public/public-form-validation';
import { ConsentField } from '@/components/ui/consent-field';
import { displayFont } from '@/lib/fonts';
import { cn } from '@/lib/utils';
import { submitMasterSubmissionAction } from './actions';

export function MasterSubmissionForm() {
  const [state, formAction, isPending] = useActionState(submitMasterSubmissionAction, null);
  const [entityType, setEntityType] = useState('INDIVIDUAL');
  const isSuccess = state?.type === 'success';

  if (isSuccess) {
    return (
      <div className="flex flex-col items-center gap-4 py-12 text-center">
        <CheckCircle aria-hidden="true" className="text-[var(--accent)]" size={48} strokeWidth={1.5} />
        <p className={cn(displayFont.className, 'text-xl font-semibold')}>Заявка отправлена</p>
        <p className="text-sm text-[var(--muted)]">После модерации карточка появится в каталоге специалистов.</p>
      </div>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-6" data-public-validation="true" noValidate>
      <FormField htmlFor="entity-type" label="Тип профиля">
        <Select
          defaultValue="INDIVIDUAL"
          id="entity-type"
          name="entityType"
          onChange={(e) => setEntityType(e.target.value)}
          required
        >
          <option value="INDIVIDUAL">Частный специалист</option>
          <option value="BUSINESS">Компания</option>
        </Select>
      </FormField>

      {entityType === 'INDIVIDUAL' ? (
        <FormField htmlFor="full-name" label="Ваше имя">
          <Input id="full-name" name="fullName" required minLength={2} maxLength={120} placeholder="Иван Иванов" />
        </FormField>
      ) : (
        <FormField htmlFor="company-name" label="Название компании">
          <Input id="company-name" name="companyName" required minLength={2} maxLength={200} placeholder="ООО «Барный сервис»" />
        </FormField>
      )}

      <FormField htmlFor="title" label="Название профиля">
        <Input id="title" name="title" required minLength={3} maxLength={200} placeholder="Настройка и обслуживание баров" />
      </FormField>

      <FormField htmlFor="message" label="Описание услуг">
        <Textarea id="message" name="message" required minLength={20} maxLength={3000} rows={5} placeholder="Расскажите о своих услугах, опыте, формате работы…" />
      </FormField>

      <FormField htmlFor="specializations" label="Специализации (через запятую)">
        <Input id="specializations" name="specializations" maxLength={300} placeholder="Настройка бара, обучение команды, аудит сервиса" />
      </FormField>

      <FormField htmlFor="service-area" label="География работы">
        <Input id="service-area" name="serviceArea" maxLength={300} placeholder="Северо-Кавказский регион, Ставропольский край" />
      </FormField>

      <fieldset className="grid gap-5 md:grid-cols-2">
        <FormField htmlFor="contact-name" label="Контактное лицо">
          <Input id="contact-name" name="name" required minLength={2} maxLength={120} placeholder="Иван Иванов" />
        </FormField>
        <FormField htmlFor="contact-email" label="Email">
          <Input id="contact-email" name="email" required type="email" maxLength={200} placeholder="ivan@example.com" />
        </FormField>
        <FormField htmlFor="contact-phone" label="Телефон">
          <Input id="contact-phone" name="phone" type="tel" maxLength={30} placeholder="+7 999 123 45 67" />
        </FormField>
        <FormField htmlFor="contact-telegram" label="Telegram">
          <Input id="contact-telegram" name="telegram" maxLength={80} placeholder="@username" />
        </FormField>
      </fieldset>

      <ConsentField>
        Я согласен на обработку персональных данных в соответствии с{' '}
        <a className="break-words text-[var(--accent)] hover:underline" href="/legal/privacy" target="_blank">политикой конфиденциальности</a>.
      </ConsentField>

      <PublicFormValidation />

      {state?.type === 'error' && !isPending ? (
        <p aria-live="polite" className="rounded-[var(--radius-sm)] border border-[var(--danger-action-bg)]/30 bg-[var(--danger-action-bg)]/10 px-3 py-2 text-sm text-[var(--danger-action-bg)]" role="alert">
          {state.message}
        </p>
      ) : null}

      <div className="flex flex-col items-stretch gap-3 border-t border-[var(--line)] pt-6 sm:flex-row sm:items-center sm:justify-end">
        <SubmitButton className="w-full sm:w-auto" disabled={isPending}>
          {isPending ? 'Отправляем…' : 'Отправить заявку'}
        </SubmitButton>
      </div>
    </form>
  );
}
