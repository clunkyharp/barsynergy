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
import { submitEducationLead } from '@/app/(public)/education/actions';

export function EducationHeroActions() {
  const [leadOpen, setLeadOpen] = useState(false);
  const [formatsOpen, setFormatsOpen] = useState(false);

  return (
    <>
      <HeroActions
        primaryLabel="Записаться на программу"
        secondaryLabel="Форматы обучения"
        onPrimaryClick={() => setLeadOpen(true)}
        onSecondaryClick={() => {
          const el = document.getElementById('education-formats');
          if (el) {
            el.scrollIntoView({ behavior: 'smooth' });
          } else {
            setFormatsOpen(true);
          }
        }}
      />

      <LeadModal
        action={submitEducationLead}
        description="Оставьте контакт — команда BARSYNERGY уточнит формат, уровень подготовки и удобное время."
        onOpenChange={setLeadOpen}
        open={leadOpen}
        title="Записаться на программу"
        submitLabel="Отправить заявку"
      >
        <div className="flex flex-col gap-4">
          <FormField htmlFor="edu-name" label="Имя">
            <Input
              autoComplete="name"
              id="edu-name"
              maxLength={160}
              minLength={2}
              name="name"
              placeholder="Иван Иванов"
              required
            />
          </FormField>
          <FormField htmlFor="edu-contact" label="Телефон или Telegram">
            <Input
              autoComplete="tel"
              id="edu-contact"
              maxLength={200}
              minLength={2}
              name="contact"
              placeholder="+7 999 123-45-67 или @username"
              required
            />
          </FormField>
          <FormField htmlFor="edu-role" label="Роль">
            <Select defaultValue="" id="edu-role" name="role" required>
              <option disabled value="">
                Выберите роль
              </option>
              <option value="barista">Бариста</option>
              <option value="manager">Менеджер</option>
              <option value="owner">Владелец</option>
              <option value="other">Другое</option>
            </Select>
          </FormField>
          <FormField htmlFor="edu-format" label="Интересующий формат">
            <Select defaultValue="" id="edu-format" name="format" required>
              <option disabled value="">
                Выберите формат
              </option>
              <option value="intensive">Интенсив для бариста</option>
              <option value="lecture">Лекция или каппинг-разбор</option>
              <option value="corporate">Обучение для команды</option>
              <option value="certificate">Сертификат / аттестация</option>
              <option value="other">Другой формат</option>
            </Select>
          </FormField>
          <FormField
            htmlFor="edu-comment"
            hint="Укажите, если есть особые пожелания к формату или времени."
            label="Комментарий"
          >
            <Textarea
              className="min-h-24"
              id="edu-comment"
              maxLength={4000}
              name="comment"
              placeholder="Хочу интенсив по эспрессо для команды из 3 человек."
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
        onOpenChange={setFormatsOpen}
        open={formatsOpen}
        title="Форматы обучения"
        ctaLabel="Подобрать формат"
        onCtaClick={() => {
          setFormatsOpen(false);
          setLeadOpen(true);
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
