'use client';

import { useState } from 'react';
import { HeroActions } from '@/components/public/hero-actions';
import { InfoModal } from '@/components/public/modals/info-modal';
import { openLeadModal } from '@/lib/public/lead-modal-bus';
import { displayFont } from '@/lib/fonts';

export function EducationHeroActions({ hasPrograms = true }: { hasPrograms?: boolean }) {
  const [formatsOpen, setFormatsOpen] = useState(false);

  return (
    <>
      <HeroActions
        primaryLabel={hasPrograms ? 'Записаться на программу' : 'Добавить программу'}
        secondaryLabel="Форматы обучения"
        onPrimaryClick={() => openLeadModal('education')}
        onSecondaryClick={() => {
          const el = document.getElementById('education-formats');
          if (el) {
            el.scrollIntoView({ behavior: 'smooth' });
          } else {
            setFormatsOpen(true);
          }
        }}
      />

      <InfoModal
        onOpenChange={setFormatsOpen}
        open={formatsOpen}
        title="Форматы обучения"
        ctaLabel="Подобрать формат"
        onCtaClick={() => {
          setFormatsOpen(false);
          openLeadModal('education');
        }}
      >
        <div className="flex flex-col gap-4">
          <div>
            <p className={`${displayFont.className} text-lg font-semibold text-[var(--text)]`}>
              Интенсив
            </p>
            <p className="mt-1 text-sm leading-6 text-[var(--muted)]">
              Разберёте экстракцию, настроите помол и отработаете стабильный эспрессо.{' '}
              <span className="text-[var(--text)]">6 часов · до 8 человек · практика</span>
            </p>
          </div>
          <div>
            <p className={`${displayFont.className} text-lg font-semibold text-[var(--text)]`}>
              Лекция / каппинг
            </p>
            <p className="mt-1 text-sm leading-6 text-[var(--muted)]">
              Одна тема за встречу: зерно, обработка, молоко, сервис или сезонное меню.{' '}
              <span className="text-[var(--text)]">2–3 часа · до 20 человек · онлайн / офлайн</span>
            </p>
          </div>
          <div>
            <p className={`${displayFont.className} text-lg font-semibold text-[var(--text)]`}>
              Обучение для команды
            </p>
            <p className="mt-1 text-sm leading-6 text-[var(--muted)]">
              Соберём программу под задачи вашего заведения и уровень команды.{' '}
              <span className="text-[var(--text)]">от 4 часов · у вас в кофейне</span>
            </p>
          </div>
          <div>
            <p className={`${displayFont.className} text-lg font-semibold text-[var(--text)]`}>
              Сертификат / аттестация
            </p>
            <p className="mt-1 text-sm leading-6 text-[var(--muted)]">
              Проверьте знания и подтвердите квалификацию по стандартам индустрии.{' '}
              <span className="text-[var(--text)]">2 часа · индивидуально · онлайн / офлайн</span>
            </p>
          </div>
        </div>
      </InfoModal>
    </>
  );
}
