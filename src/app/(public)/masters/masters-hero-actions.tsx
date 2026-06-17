'use client';

import { useState } from 'react';
import { HeroActions } from '@/components/public/hero-actions';
import { InfoModal } from '@/components/public/modals/info-modal';
import { NumberedHeroStep } from '@/components/public/numbered-hero-step';
import { openLeadModal } from '@/lib/public/lead-modal-bus';

const steps = [
  {
    title: 'Вы оставляете заявку',
    description: 'Заполните форму с описанием услуг, специализаций и контактами.'
  },
  {
    title: 'Команда проверяет профиль',
    description: 'Мы уточняем детали и сверяем информацию.'
  },
  {
    title: 'Профиль появляется в каталоге',
    description: 'После проверки карточка становится видна в каталоге мастеров.'
  },
  {
    title: 'Клиенты связываются с вами',
    description: 'Заведения видят контакты и пишут напрямую по интересующей задаче.'
  }
] as const;

export function MastersHeroActions() {
  const [infoOpen, setInfoOpen] = useState(false);

  return (
    <>
      <HeroActions
        primaryLabel="Стать мастером"
        secondaryLabel="Как это работает?"
        onPrimaryClick={() => openLeadModal('master')}
        onSecondaryClick={() => setInfoOpen(true)}
      />

      <InfoModal
        onOpenChange={setInfoOpen}
        open={infoOpen}
        title="Как это работает?"
        ctaLabel="Стать мастером"
        onCtaClick={() => {
          setInfoOpen(false);
          openLeadModal('master');
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
