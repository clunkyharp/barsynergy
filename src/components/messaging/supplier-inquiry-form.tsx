'use client';

import { useState, useActionState, useEffect } from 'react';
import {
  ContactChannelFieldset,
  HiddenUtmFields,
  HoneypotField,
} from '@/components/public/application-form-section';
import { ConsentField } from '@/components/ui/consent-field';
import { Dialog } from '@/components/ui/dialog';
import { FormField, FormSection } from '@/components/ui/form-field';
import { Input } from '@/components/ui/input';
import { InlineLink } from '@/components/ui/inline-link';
import { SubmitButton } from '@/components/ui/submit-button';
import { Textarea } from '@/components/ui/textarea';
import { Turnstile } from '@/components/ui/turnstile';
import type { PublicApplicationResult, PublicApplicationUtm } from '@/lib/applications/public-form-helpers';
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
  submitAction: (prevState: PublicApplicationResult | null, formData: FormData) => Promise<PublicApplicationResult | null>;
};

export function SupplierInquiryForm({
  supplierId,
  supplierTitle,
  supplierSlug,
  enabled,
  isAuthenticated,
  profile,
  utm,
  submitAction,
}: SupplierInquiryFormProps) {
  const [open, setOpen] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState('');
  const [turnstileError, setTurnstileError] = useState(false);
  const [state, formAction] = useActionState(submitAction, null);

  useEffect(() => {
    if (state?.type === 'success') {
      const t = setTimeout(() => setOpen(false), 2500);
      return () => clearTimeout(t);
    }
  }, [state]);

  if (!enabled) {
    return (
      <div className="space-y-4 p-5 md:p-6">
        <h3 className="text-base font-semibold leading-7">Форма сейчас закрыта</h3>
        <p className="text-sm leading-7 text-[var(--muted)]">
          Напишите команде BARSYNERGY — мы передадим запрос поставщику.
        </p>
        <div className="flex flex-wrap gap-3">
          <Button className="rounded-[var(--radius-md)]" href={`/contacts?topic=supplier&context=supplier/${supplierSlug}#contact-form`} size="lg">
            Написать команде
          </Button>
          <Button className="rounded-[var(--radius-md)]" href={`mailto:${SUPPORT_EMAIL}`} size="lg" variant="secondary">
            Написать на почту
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4 p-5 md:p-6">
        <p className="text-sm leading-6 text-[var(--muted)]">
          Оставьте запрос — поставщик получит контакт для ответа.
        </p>
        <Button
          className="w-full min-w-0 justify-center rounded-[var(--radius-sm)] px-4 !whitespace-normal leading-5"
          onClick={() => setOpen(true)}
        >
          Связаться с поставщиком
        </Button>
      </div>

      <Dialog
        open={open}
        onOpenChange={setOpen}
        title="Связаться с поставщиком"
        description={`Запрос адресован напрямую «${supplierTitle}». Опишите что нужно и укажите контакт для ответа.`}
        size="lg"
      >
        {state?.type === 'success' ? (
          <div className="py-8 text-center">
            <p className="text-lg font-semibold">Запрос отправлен</p>
            <p className="mt-2 text-sm text-[var(--muted)]">Команда BARSYNERGY передаст его поставщику.</p>
          </div>
        ) : (
          <form action={formAction}>
            <HiddenUtmFields utm={utm} />
            <HoneypotField id="supplier-inquiry-website" />
            <input name="supplierId" type="hidden" value={supplierId} />
            <input name="supplierSlug" type="hidden" value={supplierSlug} />

            <div className="mt-2 grid gap-6">
              {!isAuthenticated ? (
                <div className="rounded-[var(--radius-md)] border border-[var(--accent)]/30 bg-[var(--accent-soft)] p-4 text-sm leading-6 text-[var(--text)]">
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

            <div className="mt-6 border-t border-[var(--line)] pt-5">
              <input name="turnstileToken" type="hidden" value={turnstileToken} />
              <Turnstile onVerify={(token) => { setTurnstileToken(token); setTurnstileError(false); }} />
              <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <SubmitButton
                  className="rounded-[var(--radius-md)] sm:self-start"
                  onClick={() => { if (!turnstileToken) setTurnstileError(true); }}
                  size="lg"
                >
                  Отправить запрос
                </SubmitButton>
                {!isAuthenticated ? (
                  <p className="text-[12px] text-[var(--muted)]">
                    Без входа ответы придут на email. Войдите в аккаунт, чтобы видеть ответы в личном кабинете.
                  </p>
                ) : null}
              </div>
              {turnstileError ? (
                <p className="mt-2 text-sm text-[var(--danger)]">Дождитесь проверки «Я не робот» и повторите отправку.</p>
              ) : null}
              {state?.type === 'error' ? (
                <p className="mt-2 text-sm text-[var(--danger)]">{state.message}</p>
              ) : null}
            </div>
          </form>
        )}
      </Dialog>
    </>
  );
}
