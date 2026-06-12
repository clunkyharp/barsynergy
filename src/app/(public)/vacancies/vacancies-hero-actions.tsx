'use client';

import { useState } from 'react';
import { HeroActions } from '@/components/public/hero-actions';
import { LeadModal } from '@/components/public/modals/lead-modal';
import { InfoModal } from '@/components/public/modals/info-modal';
import { FormField } from '@/components/ui/form-field';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { ConsentField } from '@/components/ui/consent-field';
import { InlineLink } from '@/components/ui/inline-link';
import { displayFont } from '@/lib/fonts';
import { submitVacancyLead } from '@/app/(public)/vacancies/actions';

export function VacanciesHeroActions() {
  const [leadOpen, setLeadOpen] = useState(false);
  const [infoOpen, setInfoOpen] = useState(false);

  return (
    <>
      <HeroActions
        primaryLabel="Разместить вакансию"
        secondaryLabel="Как это работает?"
        onPrimaryClick={() => setLeadOpen(true)}
        onSecondaryClick={() => setInfoOpen(true)}
      />

      <LeadModal
        action={submitVacancyLead}
        description="Расскажите о позиции — мы поможем оформить публикацию для кофейного сообщества."
        onOpenChange={setLeadOpen}
        open={leadOpen}
        title="Разместить вакансию"
        submitLabel="Отправить вакансию"
      >
        <div className="flex flex-col gap-4">
          <FormField htmlFor="vac-company" label="Название компании">
            <Input
              autoComplete="organization"
              id="vac-company"
              maxLength={180}
              minLength={2}
              name="companyName"
              placeholder="Название заведения или компании"
              required
            />
          </FormField>
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField htmlFor="vac-city" label="Город">
              <Input
                autoComplete="address-level2"
                id="vac-city"
                maxLength={120}
                name="city"
                placeholder="Пятигорск"
              />
            </FormField>
            <FormField htmlFor="vac-position" label="Должность">
              <Input
                autoComplete="organization-title"
                id="vac-position"
                maxLength={180}
                minLength={2}
                name="position"
                placeholder="Бариста"
                required
              />
            </FormField>
          </div>
          <FormField htmlFor="vac-employment" label="Формат занятости">
            <Select defaultValue="" id="vac-employment" name="employmentType">
              <option value="">Любой</option>
              <option value="full_time">Полная занятость</option>
              <option value="part_time">Частичная занятость</option>
              <option value="shift">Сменный график</option>
              <option value="freelance">Проектная работа</option>
            </Select>
          </FormField>
          <FormField htmlFor="vac-contact" label="Контакт для связи">
            <Input
              autoComplete="tel"
              id="vac-contact"
              maxLength={200}
              minLength={2}
              name="contact"
              placeholder="+7 999 123-45-67 или email"
              required
            />
          </FormField>
          <FormField
            htmlFor="vac-comment"
            hint="Опишите требования, условия и контекст позиции."
            label="Комментарий"
          >
            <Textarea
              className="min-h-24"
              id="vac-comment"
              maxLength={4000}
              name="comment"
              placeholder="Ищем бариста с опытом работы от года для кофейни в центре города."
            />
          </FormField>
          <ConsentField>
            Согласен с{' '}
            <InlineLink href="/legal/privacy">политикой обработки персональных данных</InlineLink> и даю{' '}
            <InlineLink href="/legal/personal-data-consent">
              согласие на обработку персональных данных
            </InlineLink>{' '}
            для этой заявки.
          </ConsentField>
        </div>
      </LeadModal>

      <InfoModal
        onOpenChange={setInfoOpen}
        open={infoOpen}
        title="Как это работает?"
        ctaLabel="Разместить вакансию"
        onCtaClick={() => {
          setInfoOpen(false);
          setLeadOpen(true);
        }}
      >
        <div className="flex flex-col gap-5">
          <div className="flex gap-3">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--accent)] text-[11px] font-bold text-[var(--accent-contrast)]">
              1
            </span>
            <div>
              <p className={`${displayFont.className} text-sm font-semibold text-[var(--text)]`}>
                Вы отправляете вакансию
              </p>
              <p className="mt-0.5 text-sm leading-6 text-[var(--muted)]">
                Заполните форму с описанием позиции, требованиями и контактом.
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--accent)] text-[11px] font-bold text-[var(--accent-contrast)]">
              2
            </span>
            <div>
              <p className={`${displayFont.className} text-sm font-semibold text-[var(--text)]`}>
                Команда проверяет описание
              </p>
              <p className="mt-0.5 text-sm leading-6 text-[var(--muted)]">
                Мы уточняем детали и проверяем, что вакансия соответствует формату платформы.
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--accent)] text-[11px] font-bold text-[var(--accent-contrast)]">
              3
            </span>
            <div>
              <p className={`${displayFont.className} text-sm font-semibold text-[var(--text)]`}>
                Вакансия публикуется
              </p>
              <p className="mt-0.5 text-sm leading-6 text-[var(--muted)]">
                После согласования вакансия появляется в каталоге платформы.
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--accent)] text-[11px] font-bold text-[var(--accent-contrast)]">
              4
            </span>
            <div>
              <p className={`${displayFont.className} text-sm font-semibold text-[var(--text)]`}>
                Кандидаты связываются с вами
              </p>
              <p className="mt-0.5 text-sm leading-6 text-[var(--muted)]">
                Заинтересованные специалисты пишут напрямую по указанному контакту.
              </p>
            </div>
          </div>
        </div>
      </InfoModal>
    </>
  );
}
