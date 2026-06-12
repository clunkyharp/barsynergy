'use client';

import { VacancyResponseDialog } from '@/components/public/vacancy-application-forms';
import type { VacancyApplicationFormOptions } from '@/lib/public/content';
import type { VacancyApplicationFormsProps } from '@/components/public/vacancy-application-forms';
import type { ProfilePrefill, SelectedVacancy, ActionResult } from '@/components/public/vacancy-application-forms';

export function VacancyMobileStickyBar({
  options,
  selectedVacancy,
  utm,
  profile,
  enabled,
  submitVacancyResponseApplication,
}: {
  options: VacancyApplicationFormOptions;
  selectedVacancy: SelectedVacancy;
  utm: VacancyApplicationFormsProps['utm'];
  profile?: ProfilePrefill;
  enabled: boolean;
  submitVacancyResponseApplication: (prevState: ActionResult | null, formData: FormData) => Promise<ActionResult | null>;
}) {
  if (!enabled) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-[var(--line)] bg-[var(--surface)] p-4 xl:hidden">
      <VacancyResponseDialog
        compact
        enabled={enabled}
        options={options}
        profile={profile}
        selectedVacancy={selectedVacancy}
        utm={utm}
        submitVacancyResponseApplication={submitVacancyResponseApplication}
      />
    </div>
  );
}
