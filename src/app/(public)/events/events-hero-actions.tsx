'use client';

import { useState } from 'react';
import { HeroActions } from '@/components/public/hero-actions';
import { InfoModal } from '@/components/public/modals/info-modal';
import { NumberedHeroStep } from '@/components/public/numbered-hero-step';
import { openLeadModal } from '@/lib/public/lead-modal-bus';

const steps = [
  {
    title: 'Вы отправляете событие',
    description: 'Заполните форму с названием, компанией и контактом.'
  },
  {
    title: 'Команда проверяет описание',
    description: 'Мы уточняем детали и проверяем, что событие соответствует формату платформы.'
  },
  {
    title: 'Анонс публикуется в афише',
    description: 'После согласования событие появляется в афише на платформе.'
  }
] as const;

export function EventsHeroActions() {
  const [infoOpen, setInfoOpen] = useState(false);

  return (
    <>
      <HeroActions
        primaryLabel="Добавить событие"
        secondaryLabel="Как это работает?"
        onPrimaryClick={() => openLeadModal('event')}
        onSecondaryClick={() => setInfoOpen(true)}
      />

      <InfoModal
        onOpenChange={setInfoOpen}
        open={infoOpen}
        title="Как это работает?"
        ctaLabel="Добавить событие"
        onCtaClick={() => {
          setInfoOpen(false);
          openLeadModal('event');
        }}
      >
        <div className="flex flex-col gap-5">
          {steps.map((step, index) => (
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
