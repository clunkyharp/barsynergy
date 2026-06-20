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
    <div className="vacancies-hero-stat flex items-baseline gap-3">
      <span className={`${displayFont.className} text-[2rem] font-bold leading-none tabular-nums text-[var(--accent)]`}>
        {value.toLocaleString('ru-RU')}
      </span>
      <span className="text-[0.9375rem] text-[var(--muted)]">{label}</span>
    </div>
  );
}

export function VacanciesHeroStats({ vacanciesCount, specialistsCount }: VacanciesHeroActionsProps) {
  const searchParams = useSearchParams();
  const view = searchParams.get('view') ?? 'vacancies';

  if (view === 'specialists') {
    return (
      <div className="vacancies-hero-stats">
        {typeof specialistsCount === 'number' ? (
          <HeroStat label="специалистов в каталоге" value={specialistsCount} />
        ) : null}
      </div>
    );
  }

  return (
    <div className="vacancies-hero-stats">
      {typeof vacanciesCount === 'number' ? (
        <HeroStat label="актуальных вакансий" value={vacanciesCount} />
      ) : null}
    </div>
  );
}

export function VacanciesHeroActions() {
  const searchParams = useSearchParams();
  const view = searchParams.get('view') ?? 'vacancies';

  if (view === 'specialists') {
    return (
      <div className="vacancies-hero-actions">
        <Button href="/profile/settings/career#publish">Опубликовать резюме</Button>
        <Button href="/specialists/svc/new" variant="secondary">Предложить услуги</Button>
      </div>
    );
  }

  return (
    <div className="vacancies-hero-actions">
      <Button onClick={() => openLeadModal('vacancy')} type="button">Разместить вакансию</Button>
    </div>
  );
}
