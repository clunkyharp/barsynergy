'use client';

import { useState } from 'react';
import { HeroActions } from '@/components/public/hero-actions';
import { InfoModal } from '@/components/public/modals/info-modal';
import { NumberedHeroStep } from '@/components/public/numbered-hero-step';
import { openLeadModal } from '@/lib/public/lead-modal-bus';

const steps = [
  {
    title: 'Вы отправляете данные компании',
    description: 'Заполните форму с названием, категорией и контактами.'
  },
  {
    title: 'Команда проверяет профиль',
    description: 'Мы сверяем данные и связываемся для уточнения.'
  },
  {
    title: 'Карточка появляется в каталоге',
    description: 'После проверки компания становится видна в каталоге поставщиков.'
  },
  {
    title: 'Клиенты могут связаться с вами',
    description: 'Потенциальные заказчики видят контакты и пишут напрямую.'
  }
] as const;

export function SuppliersHeroActions() {
  const [infoOpen, setInfoOpen] = useState(false);

  return (
    <>
      <HeroActions
        primaryLabel="Добавить компанию"
        secondaryLabel="Как стать поставщиком?"
        onPrimaryClick={() => openLeadModal('supplier')}
        onSecondaryClick={() => setInfoOpen(true)}
      />

      <InfoModal
        onOpenChange={setInfoOpen}
        open={infoOpen}
        title="Как стать поставщиком?"
        ctaLabel="Добавить компанию"
        onCtaClick={() => {
          setInfoOpen(false);
          openLeadModal('supplier');
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
