'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { HeroActions } from '@/components/public/hero-actions';
import { InfoModal } from '@/components/public/modals/info-modal';
import { NumberedHeroStep } from '@/components/public/numbered-hero-step';
import { openLeadModal } from '@/lib/public/lead-modal-bus';

const vacancySteps = [
  {
    title: 'Вы отправляете вакансию',
    description: 'Заполните форму с описанием позиции, требованиями и контактом.'
  },
  {
    title: 'Команда проверяет описание',
    description: 'Мы уточняем детали и проверяем, что вакансия соответствует формату платформы.'
  },
  {
    title: 'Вакансия публикуется',
    description: 'После согласования вакансия появляется в каталоге платформы.'
  },
  {
    title: 'Кандидаты связываются с вами',
    description: 'Заинтересованные специалисты пишут напрямую по указанному контакту.'
  }
] as const;

export function VacanciesHeroActions() {
  const searchParams = useSearchParams();
  const view = searchParams.get('view') ?? 'vacancies';
  const [infoOpen, setInfoOpen] = useState(false);

  if (view === 'specialists') {
    return (
      <div className="flex flex-wrap gap-3">
        <HeroActions
          primaryLabel="Опубликовать резюме"
          secondaryLabel="Предложить услуги"
          onPrimaryClick={() => {
            window.location.href = '/profile/settings#publish';
          }}
          onSecondaryClick={() => {
            window.location.href = '/specialists/svc/new';
          }}
        />
      </div>
    );
  }

  return (
    <>
      <HeroActions
        primaryLabel="Разместить вакансию"
        secondaryLabel="Как это работает?"
        onPrimaryClick={() => openLeadModal('vacancy')}
        onSecondaryClick={() => setInfoOpen(true)}
      />

      <InfoModal
        onOpenChange={setInfoOpen}
        open={infoOpen}
        title="Как это работает?"
        ctaLabel="Разместить вакансию"
        onCtaClick={() => {
          setInfoOpen(false);
          openLeadModal('vacancy');
        }}
      >
        <div className="flex flex-col gap-5">
          {vacancySteps.map((step, index) => (
            <NumberedHeroStep
              description={step.description}
              key={step.title}
              number={index + 1}
              title={step.title}
            />
          ))}
        </div>
      </InfoModal>
    </>
  );
}
