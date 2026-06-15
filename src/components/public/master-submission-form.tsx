'use client';

import { useActionState, useRef } from 'react';
import {
  HiddenUtmFields,
  HoneypotField,
  PublicApplicationSection,
  PublicFormShellFooter,
  PublicFormShellHeader,
  type PublicApplicationFormProps
} from '@/components/public/application-form-section';
import { MasterSubmissionFields } from '@/components/public/master-application-forms-internal';
import { SubmitButton } from '@/components/ui/submit-button';
import type { PublicApplicationResult } from '@/lib/applications/public-form-helpers';
import { useFormDraftAutoSave } from '@/lib/hooks/use-form-draft';

export function MasterSubmissionForm({
  enabled,
  utm,
  cities,
  action
}: Omit<PublicApplicationFormProps, 'result'> & {
  action: (prevState: PublicApplicationResult | null, formData: FormData) => Promise<PublicApplicationResult>;
}) {
  const [result, formAction] = useActionState(action, null);
  const formRef = useRef<HTMLFormElement>(null);
  useFormDraftAutoSave('master-submission', formRef);

  return (
    <PublicApplicationSection
      eyebrow="Мастера / Заявка"
      title="Стать мастером"
      description="Опишите профиль, услуги, географию и контакт. После проверки карточку можно будет опубликовать в каталоге."
      disclosureAliases={['join', 'new', 'applications']}
      disclosureFocusSelector="#masterTitle"
      disclosureId="master-submission"
      disclosureOpenLabel="Стать мастером"
      disclosureTitle="Заявка мастера"
      disclosureDescription="Заполните профиль. Команда свяжется для уточнения деталей перед публикацией."
      enabled={enabled}
      introVariant="compact"
      result={result ?? undefined}
    >
      <form
        action={formAction}
        className="editorial-form-shell public-form-shell"
        data-ux-event="master_submission_started"
        data-ux-result={result?.type ?? 'idle'}
        data-ux-success-event={result?.type === 'success' ? 'master_submission_submitted' : undefined}
        ref={formRef}
      >
        <HiddenUtmFields utm={utm} />
        <HoneypotField id="master-submission-website" />
        <PublicFormShellHeader
          eyebrow="Профиль и услуги"
          title="Заявка в каталог мастеров"
          description="Покажите, какую задачу решаете для заведений и где работаете."
        />
        <div className="relative p-5 md:p-6">
          <MasterSubmissionFields cities={cities} />
          <PublicFormShellFooter>
            <SubmitButton className="min-h-12 rounded-[var(--radius-md)] px-6 tracking-normal sm:self-start">
              Отправить заявку
            </SubmitButton>
          </PublicFormShellFooter>
        </div>
      </form>
    </PublicApplicationSection>
  );
}
