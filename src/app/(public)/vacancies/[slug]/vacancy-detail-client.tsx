'use client';

import { useState, useEffect } from 'react';
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
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const rail = document.getElementById('vacancy-apply-rail');
    if (!rail) return;

    const observer = new IntersectionObserver(
      ([entry]) => setHidden(entry.isIntersecting),
      { threshold: 0.15 }
    );
    observer.observe(rail);
    return () => observer.disconnect();
  }, []);

  if (!enabled) return null;

  return (
    <div
      className={`fixed inset-x-0 bottom-0 z-40 border-t border-[var(--line)] bg-[var(--surface)] p-4 transition-transform duration-200 xl:hidden ${hidden ? 'translate-y-full opacity-0 pointer-events-none' : 'translate-y-0 opacity-100'}`}
    >
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
