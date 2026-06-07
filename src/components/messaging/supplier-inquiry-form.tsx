'use client';

import { useActionState } from 'react';
import { Button } from '@/components/ui/button';
import { ConsentField } from '@/components/ui/consent-field';
import { FormField } from '@/components/ui/form-field';
import { Input } from '@/components/ui/input';
import { InlineLink } from '@/components/ui/inline-link';
import { Textarea } from '@/components/ui/textarea';
import { submitSupplierInquiryAction } from '@/lib/messaging/supplier-inquiry-action';

type SupplierInquiryFormProps = {
  supplierId: string;
  isAuthenticated: boolean;
  prefill?: {
    name?: string;
    email?: string;
    phone?: string;
  };
};

export function SupplierInquiryForm({ supplierId, isAuthenticated, prefill }: SupplierInquiryFormProps) {
  const [, formAction, isPending] = useActionState(
    async (_prev: null, formData: FormData) => {
      await submitSupplierInquiryAction(formData);
      return null;
    },
    null
  );

  return (
    <form action={formAction} className="space-y-4">
      <input name="supplierId" type="hidden" value={supplierId} />

      <FormField htmlFor="inquiryContactName" label="Ваше имя">
        <Input
          defaultValue={prefill?.name ?? ''}
          id="inquiryContactName"
          maxLength={160}
          minLength={2}
          name="contactName"
          placeholder="Иван Иванов"
          required
        />
      </FormField>

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

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField htmlFor="inquiryEmail" label="Email">
          <Input
            defaultValue={prefill?.email ?? ''}
            id="inquiryEmail"
            name="email"
            placeholder="email@example.ru"
            type="email"
          />
        </FormField>
        <FormField htmlFor="inquiryPhone" label="Телефон">
          <Input
            defaultValue={prefill?.phone ?? ''}
            id="inquiryPhone"
            name="phone"
            placeholder="+7 (___) ___-__-__"
            type="tel"
          />
        </FormField>
      </div>

      <ConsentField>
        Согласен с <InlineLink href="/legal/privacy">политикой обработки персональных данных</InlineLink> и даю{' '}
        <InlineLink href="/legal/personal-data-consent">согласие на обработку персональных данных</InlineLink>.
      </ConsentField>

      <Button disabled={isPending} loading={isPending} loadingText="Отправка..." type="submit">
        Отправить запрос
      </Button>

      {!isAuthenticated ? (
        <p className="text-[12px] text-[var(--muted)]">
          Войдите в аккаунт, чтобы видеть ответы в личном кабинете. Без входа ответы придут на email.
        </p>
      ) : null}
    </form>
  );
}
