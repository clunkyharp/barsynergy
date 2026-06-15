'use client';

import { useActionState } from 'react';
import {
  HiddenUtmFields,
  HoneypotField,
  PublicFormShellFooter,
  PublicFormShellHeader
} from '@/components/public/application-form-section';
import { MasterInquiryFields } from '@/components/public/master-application-forms-internal';
import { SubmitButton } from '@/components/ui/submit-button';
import type { PublicApplicationResult, PublicApplicationUtm } from '@/lib/applications/public-form-helpers';

type MasterInquiryFormProps = {
  enabled: boolean;
  masterId: string;
  masterTitle: string;
  profile?: { fullName?: string; email?: string };
  utm: PublicApplicationUtm;
  submitAction: (prevState: PublicApplicationResult | null, formData: FormData) => Promise<PublicApplicationResult>;
};

export function MasterInquiryForm({
  enabled,
  masterId,
  masterTitle,
  profile,
  utm,
  submitAction
}: MasterInquiryFormProps) {
  const [result, formAction] = useActionState(submitAction, null);

  return (
    <form
      action={formAction}
      className="editorial-form-shell public-form-shell"
      data-ux-event="master_inquiry_started"
      data-ux-result={result?.type ?? 'idle'}
      data-ux-success-event={result?.type === 'success' ? 'master_inquiry_submitted' : undefined}
    >
      <HiddenUtmFields utm={utm} />
      <HoneypotField id="master-inquiry-website" />
      <PublicFormShellHeader
        eyebrow="Мастера / Запрос"
        title="Написать мастеру"
        description={enabled ? 'Опишите задачу и оставьте контакт.' : 'Форма временно закрыта.'}
      />
      <div className="relative p-5 md:p-6">
        {enabled ? (
          <>
            <MasterInquiryFields masterId={masterId} masterTitle={masterTitle} profile={profile} />
            <PublicFormShellFooter>
              <SubmitButton className="min-h-12 rounded-[var(--radius-md)] px-6 tracking-normal sm:self-start">
                Отправить запрос
              </SubmitButton>
            </PublicFormShellFooter>
          </>
        ) : null}
        {result ? (
          <p className={`mt-4 text-sm leading-6 ${result.type === 'error' ? 'text-[var(--danger)]' : 'text-[var(--success)]'}`}>
            {result.message}
          </p>
        ) : null}
      </div>
    </form>
  );
}
