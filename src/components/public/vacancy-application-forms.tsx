'use client';

import { useEffect, useState, useActionState } from 'react';
import { PublicApplicationSection } from '@/components/public/application-form-section';
import { Button } from '@/components/ui/button';
import { Dialog } from '@/components/ui/dialog';
import { SUPPORT_EMAIL } from '@/lib/contact-info';
import {
  VacancyResponseForm,
  VacancySubmissionForm,
  type ActionResult,
  type ProfilePrefill,
  type SelectedVacancy,
  type VacancyApplicationFormsProps,
} from './vacancy-application-forms-internal';
import type { VacancyApplicationFormOptions } from '@/lib/public/content';

export {
  type ActionResult,
  type SelectedVacancy,
  type ProfilePrefill,
  type VacancyApplicationFormsProps,
  VacancyResponseForm,
  VacancySubmissionForm,
} from './vacancy-application-forms-internal';

export function VacancyResponseDialog({
  options,
  selectedVacancy,
  utm,
  profile,
  enabled,
  compact = false,
  submitVacancyResponseApplication
}: {
  options: VacancyApplicationFormOptions;
  selectedVacancy: SelectedVacancy;
  utm: VacancyApplicationFormsProps['utm'];
  profile?: ProfilePrefill;
  enabled: boolean;
  compact?: boolean;
  submitVacancyResponseApplication: (prevState: ActionResult | null, formData: FormData) => Promise<ActionResult | null>;
}) {
  const [open, setOpen] = useState(false);
  const [state, formAction] = useActionState(submitVacancyResponseApplication, null);

  useEffect(() => {
    if (state?.type === 'success') {
      const t = setTimeout(() => setOpen(false), 2500);
      return () => clearTimeout(t);
    }
  }, [state]);

  if (!enabled) {
    return (
      <div className="space-y-4">
        <h3 className="text-base font-semibold leading-7">Приём откликов временно закрыт</h3>
        <p className="text-sm leading-7 text-[var(--muted)]">
          Напишите команде BARSYNERGY — мы передадим вашу кандидатуру работодателю.
        </p>
        <div className="flex flex-wrap gap-3">
          <Button className="rounded-[var(--radius-md)]" href="/contacts?topic=vacancy#contact-form" size="lg">
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
      {!compact ? (
        <p className="text-sm leading-6 text-[var(--muted)]">
          Заполните форму — мы передадим вашу кандидатуру работодателю.
        </p>
      ) : null}
      <Button
        className="w-full min-w-0 justify-center rounded-[var(--radius-sm)] px-4 !whitespace-normal leading-5"
        onClick={() => setOpen(true)}
      >
        Откликнуться
      </Button>
      <Dialog
        open={open}
        onOpenChange={setOpen}
        title="Отклик на вакансию"
        size="lg"
      >
        {state?.type === 'success' ? (
          <div className="py-8 text-center">
            <p className="text-lg font-semibold">Отклик отправлен</p>
            <p className="mt-2 text-sm text-[var(--muted)]">Спасибо! Мы передадим вашу кандидатуру работодателю.</p>
          </div>
        ) : (
          <VacancyResponseForm
            action={formAction}
            options={options}
            selectedVacancy={selectedVacancy}
            utm={utm}
            profile={profile}
          />
        )}
      </Dialog>
    </>
  );
}

export function VacancyApplicationForms({
  enabled,
  options,
  utm,
  submitVacancyPlacementApplication
}: Omit<VacancyApplicationFormsProps, 'result'> & { submitVacancyPlacementApplication?: (prevState: import('@/lib/applications/public-form-helpers').PublicApplicationResult | null, formData: FormData) => Promise<import('@/lib/applications/public-form-helpers').PublicApplicationResult> }) {
  return (
    <PublicApplicationSection
      eyebrow="Вакансии / Заявки"
      title="Разместить вакансию"
      description="Заполните роль, условия и контакты компании. После проверки подготовим вакансию к публикации."
      disclosureAliases={['applications', 'vacancy-submission', 'vacancy-forms']}
      disclosureClosedPanelClassName="max-w-2xl"
      disclosureFocusSelector="#companyName"
      disclosureId="submit-vacancy"
      disclosureOpenLabel="Заполнить вакансию"
      disclosureTitle="Заявка на публикацию"
      disclosureDescription="Укажите роль, город, график, условия, требования и контакт для отклика."
      introVariant="compact"
      enabled={enabled}
    >
      <div className="grid gap-6" id="vacancy-forms">
        <VacancySubmissionForm options={options} utm={utm} action={submitVacancyPlacementApplication!} />
      </div>
    </PublicApplicationSection>
  );
}
