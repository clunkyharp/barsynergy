'use client';

import { useState } from 'react';
import {
  ContactChannelFieldset,
  HiddenUtmFields,
  HoneypotField,
  PublicFormShellFooter,
  PublicFormShellHeader,
  PublicSubmissionFeedback
} from '@/components/public/application-form-section';
import { ConsentField } from '@/components/ui/consent-field';
import { EditorialShell } from '@/components/ui/editorial-shell';
import { FormField, FormSection } from '@/components/ui/form-field';
import { Input } from '@/components/ui/input';
import { InlineLink } from '@/components/ui/inline-link';
import { SubmitButton } from '@/components/ui/submit-button';
import { Textarea } from '@/components/ui/textarea';
import { Turnstile } from '@/components/ui/turnstile';
import type { PublicApplicationResult, PublicApplicationUtm } from '@/lib/applications/public-form-helpers';
import { submitSupplierInquiryAction } from '@/lib/messaging/supplier-inquiry-action';
import { Button } from '@/components/ui/button';
import { SUPPORT_EMAIL } from '@/lib/contact-info';

export type SupplierInquiryFormProps = {
  supplierId: string;
  supplierTitle: string;
  supplierSlug: string;
  enabled: boolean;
  isAuthenticated: boolean;
  profile?: {
    fullName?: string;
    email?: string;
    phone?: string;
  };
  utm: PublicApplicationUtm;
  result?: PublicApplicationResult;
};

export function SupplierInquiryForm({
  supplierId,
  supplierTitle,
  supplierSlug,
  enabled,
  isAuthenticated,
  profile,
  utm,
  result
}: SupplierInquiryFormProps) {
  const [turnstileToken, setTurnstileToken] = useState('');
  const [turnstileError, setTurnstileError] = useState(false);

  if (!enabled) {
    return (
      <EditorialShell className="p-5 md:p-6">
        <h3 className="text-lg font-semibold leading-7">Форма сейчас закрыта</h3>
        <p className="mt-3 text-sm leading-7 text-[var(--muted)]">
          Напишите команде BARSYNERGY — мы передадим запрос поставщику.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Button className="rounded-[var(--radius-md)]" href={`/contacts?topic=supplier&context=supplier/${supplierSlug}#contact-form`} size="lg">
            Написать команде
          </Button>
          <Button className="rounded-[var(--radius-md)]" href={`mailto:${SUPPORT_EMAIL}`} size="lg" variant="secondary">
            Написать на почту
          </Button>
        </div>
      </EditorialShell>
    );
  }

  if (result) {
    return (
      <EditorialShell className="p-5 md:p-6">
        <PublicSubmissionFeedback result={result} title={result.type === 'success' ? 'Запрос отправлен' : 'Не удалось отправить'} />
      </EditorialShell>
    );
  }

  return (
    <form action={submitSupplierInquiryAction} className="editorial-form-shell public-form-shell">
      <HiddenUtmFields utm={utm} />
      <HoneypotField id="supplier-inquiry-website" />
      <input name="supplierId" type="hidden" value={supplierId} />
      <input name="supplierSlug" type="hidden" value={supplierSlug} />

      <PublicFormShellHeader
        eyebrow="Запрос поставщику"
        title="Связаться с поставщиком"
        description={`Запрос адресован напрямую «${supplierTitle}». Опишите что нужно и укажите контакт для ответа.`}
        headingLevel="h3"
      />

      <div className="relative p-5 md:p-6">
        {!isAuthenticated ? (
          <div className="mb-5 rounded-[var(--radius-md)] border border-[var(--accent)]/30 bg-[var(--accent-soft)] p-4 text-sm leading-6 text-[var(--text)]">
            <p className="font-semibold">Есть аккаунт?</p>
            <p className="mt-1 text-[var(--muted)]">
              <InlineLink className="text-[var(--accent)]" href={`/auth/login?returnTo=/suppliers/${supplierSlug}`}>
                Войдите
              </InlineLink>
              {' '}или{' '}
              <InlineLink className="text-[var(--accent)]" href="/auth/register/user">
                зарегистрируйтесь
              </InlineLink>
              , чтобы поля заполнились автоматически и запрос сохранился в истории.
            </p>
          </div>
        ) : null}

        <div className="grid gap-6">
          <FormSection title="Контакт" description="Укажите имя и любой удобный канал связи.">
            <FormField htmlFor="inquiryContactName" label="Ваше имя">
              <Input
                defaultValue={profile?.fullName ?? ''}
                id="inquiryContactName"
                maxLength={160}
                minLength={2}
                name="contactName"
                placeholder="Иван Иванов"
                required
              />
            </FormField>
            <ContactChannelFieldset
              defaults={{ email: profile?.email, phone: profile?.phone }}
              emailId="inquiryEmail"
              phoneId="inquiryPhone"
              telegramId="inquiryTelegram"
            />
          </FormSection>

          <FormSection title="Запрос" description="Что нужно от поставщика и в каком объёме.">
            <FormField htmlFor="inquiryProductCategory" label="Категория продукции">
              <Input
                id="inquiryProductCategory"
                maxLength={200}
                minLength={2}
                name="productCategory"
                placeholder="Например, кофейное зерно, сиропы"
                required
              />
            </FormField>
            <FormField htmlFor="inquiryVolumeDetails" label="Объём и детали запроса">
              <Textarea
                className="min-h-[100px]"
                id="inquiryVolumeDetails"
                maxLength={2000}
                minLength={10}
                name="volumeDetails"
                placeholder="Опишите что нужно, в каком объёме и в какие сроки..."
                required
              />
            </FormField>
          </FormSection>

          <ConsentField>
            Согласен с{' '}
            <InlineLink href="/legal/privacy">политикой обработки персональных данных</InlineLink> и даю{' '}
            <InlineLink href="/legal/personal-data-consent">согласие на обработку персональных данных</InlineLink>, включая передачу контактов поставщику для ответа на запрос.
          </ConsentField>
        </div>

        <input name="turnstileToken" type="hidden" value={turnstileToken} />
        <Turnstile onVerify={(token) => { setTurnstileToken(token); setTurnstileError(false); }} />

        <PublicFormShellFooter>
          <SubmitButton className="rounded-[var(--radius-md)] sm:self-start" onClick={() => { if (!turnstileToken) setTurnstileError(true); }} size="lg">
            Отправить запрос
          </SubmitButton>
          {turnstileError ? (
            <p className="text-sm text-[var(--danger)]">Дождитесь проверки «Я не робот» и повторите отправку.</p>
          ) : null}
          {!isAuthenticated ? (
            <p className="text-[12px] text-[var(--muted)]">
              Без входа ответы придут на email. Войдите в аккаунт, чтобы видеть ответы в личном кабинете.
            </p>
          ) : null}
        </PublicFormShellFooter>
      </div>
    </form>
  );
}
