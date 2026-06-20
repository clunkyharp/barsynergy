'use client';

import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { displayFont } from '@/lib/fonts';
import { openLeadModal } from '@/lib/public/lead-modal-bus';

type VacanciesHeroActionsProps = {
  vacanciesCount?: number;
  specialistsCount?: number;
};

function HeroStat({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex items-baseline gap-3">
      <span className={`${displayFont.className} text-[2rem] font-bold leading-none tabular-nums text-[var(--accent)]`}>
        {value.toLocaleString('ru-RU')}
      </span>
      <span className="text-[0.9375rem] text-[var(--muted)]">{label}</span>
    </div>
  );
}

export function VacanciesHeroActions({ vacanciesCount, specialistsCount }: VacanciesHeroActionsProps) {
  const searchParams = useSearchParams();
  const view = searchParams.get('view') ?? 'vacancies';

  if (view === 'specialists') {
    return (
      <div className="flex flex-col gap-6">
        {typeof specialistsCount === 'number' ? (
          <HeroStat label="специалистов в каталоге" value={specialistsCount} />
        ) : null}
        <div className="flex flex-wrap gap-3">
          <Button href="/profile/settings/career#publish">Опубликовать резюме</Button>
          <Button href="/specialists/svc/new" variant="on-dark">Предложить услуги</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {typeof vacanciesCount === 'number' ? (
        <HeroStat label="актуальных вакансий" value={vacanciesCount} />
      ) : null}
      <div className="flex flex-wrap gap-3">
        <Button onClick={() => openLeadModal('vacancy')} type="button">Разместить вакансию</Button>
        <Button href="/vacancies?view=specialists" variant="on-dark">Я — специалист</Button>
      </div>
    </div>
  );
}
