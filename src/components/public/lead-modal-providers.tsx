'use client';

import { useEffect, useState } from 'react';
import { LeadModal } from '@/components/public/modals/lead-modal';
import { subscribeLeadModal } from '@/lib/public/lead-modal-bus';
import { FormField } from '@/components/ui/form-field';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { ConsentField } from '@/components/ui/consent-field';
import { InlineLink } from '@/components/ui/inline-link';
import type { PublicApplicationResult } from '@/lib/applications/public-form-helpers';

type LeadAction = (prevState: PublicApplicationResult | null, formData: FormData) => Promise<PublicApplicationResult | null>;

export type LeadModalActions = {
  submitVacancyLead: LeadAction;
  submitEventLead: LeadAction;
  submitEducationLead: LeadAction;
  submitSupplierLead: LeadAction;
};

function ConsentRow() {
  return (
    <ConsentField>
      Согласен с{' '}
      <InlineLink href="/legal/privacy">политикой обработки персональных данных</InlineLink> и даю{' '}
      <InlineLink href="/legal/personal-data-consent">
        согласие на обработку персональных данных
      </InlineLink>{' '}
      для этой заявки.
    </ConsentField>
  );
}

function VacancyLeadProvider({ action }: { action: LeadAction }) {
  const [open, setOpen] = useState(false);
  useEffect(() => subscribeLeadModal('vacancy', () => setOpen(true)), []);

  return (
    <LeadModal
      action={action}
      description="Расскажите о позиции — мы поможем оформить публикацию для кофейного сообщества."
      onOpenChange={setOpen}
      open={open}
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
        <ConsentRow />
      </div>
    </LeadModal>
  );
}

function EventLeadProvider({ action }: { action: LeadAction }) {
  const [open, setOpen] = useState(false);
  useEffect(() => subscribeLeadModal('event', () => setOpen(true)), []);

  return (
    <LeadModal
      action={action}
      description="Расскажите о вашем мероприятии — мы поможем оформить публикацию для сообщества."
      onOpenChange={setOpen}
      open={open}
      title="Добавить событие"
      submitLabel="Отправить событие"
    >
      <div className="flex flex-col gap-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField htmlFor="ev-company" label="Название компании">
            <Input
              autoComplete="organization"
              id="ev-company"
              maxLength={180}
              minLength={2}
              name="companyName"
              placeholder="Название заведения или компании"
              required
            />
          </FormField>
          <FormField htmlFor="ev-city" label="Город">
            <Input
              autoComplete="address-level2"
              id="ev-city"
              maxLength={120}
              name="city"
              placeholder="Пятигорск"
            />
          </FormField>
        </div>
        <FormField htmlFor="ev-title" label="Название события">
          <Input
            id="ev-title"
            maxLength={180}
            minLength={2}
            name="eventTitle"
            placeholder="Каппинг, лекция, мастер-класс…"
            required
          />
        </FormField>
        <FormField htmlFor="ev-contact" label="Контакт для связи">
          <Input
            autoComplete="tel"
            id="ev-contact"
            maxLength={200}
            minLength={2}
            name="contact"
            placeholder="+7 999 123-45-67 или email"
            required
          />
        </FormField>
        <FormField
          htmlFor="ev-comment"
          hint="Опишите формат, дату и другие детали."
          label="Комментарий"
        >
          <Textarea
            className="min-h-24"
            id="ev-comment"
            maxLength={4000}
            name="comment"
            placeholder="Открытая дегустация specialty-кофе, участие бесплатное, нужна регистрация."
          />
        </FormField>
        <ConsentRow />
      </div>
    </LeadModal>
  );
}

function EducationLeadProvider({ action }: { action: LeadAction }) {
  const [open, setOpen] = useState(false);
  useEffect(() => subscribeLeadModal('education', () => setOpen(true)), []);

  return (
    <LeadModal
      action={action}
      description="Оставьте контакт — команда BARSYNERGY уточнит формат, уровень подготовки и удобное время."
      onOpenChange={setOpen}
      open={open}
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
        <ConsentRow />
      </div>
    </LeadModal>
  );
}

function SupplierLeadProvider({ action }: { action: LeadAction }) {
  const [open, setOpen] = useState(false);
  useEffect(() => subscribeLeadModal('supplier', () => setOpen(true)), []);

  return (
    <LeadModal
      action={action}
      description="Оставьте данные поставщика — команда проверит информацию и свяжется с вами."
      onOpenChange={setOpen}
      open={open}
      title="Добавить компанию"
      submitLabel="Отправить заявку"
    >
      <div className="flex flex-col gap-4">
        <FormField htmlFor="sup-company" label="Название компании">
          <Input
            autoComplete="organization"
            id="sup-company"
            maxLength={180}
            minLength={2}
            name="companyName"
            placeholder="Название компании"
            required
          />
        </FormField>
        <FormField htmlFor="sup-category" label="Категория поставщика">
          <Select defaultValue="" id="sup-category" name="category" required>
            <option disabled value="">
              Выберите категорию
            </option>
            <option value="coffee">Кофе</option>
            <option value="equipment">Оборудование</option>
            <option value="packaging">Упаковка</option>
            <option value="tableware">Посуда</option>
            <option value="milk">Молоко</option>
            <option value="syrup">Сиропы</option>
            <option value="service">Сервис</option>
            <option value="other">Другое</option>
          </Select>
        </FormField>
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField htmlFor="sup-city" label="Город / регион">
            <Input
              autoComplete="address-level2"
              id="sup-city"
              maxLength={120}
              name="city"
              placeholder="Пятигорск"
            />
          </FormField>
          <FormField htmlFor="sup-website" label="Сайт или соцсеть">
            <Input
              autoComplete="url"
              id="sup-website"
              maxLength={500}
              name="website"
              placeholder="example.com или @social"
              type="text"
            />
          </FormField>
        </div>
        <FormField htmlFor="sup-contact" label="Контакт">
          <Input
            autoComplete="tel"
            id="sup-contact"
            maxLength={200}
            minLength={2}
            name="contact"
            placeholder="+7 999 123-45-67 или email"
            required
          />
        </FormField>
        <FormField
          htmlFor="sup-comment"
          hint="Расскажите о ваших продуктах, услугах и регионе работы."
          label="Комментарий"
        >
          <Textarea
            className="min-h-24"
            id="sup-comment"
            maxLength={4000}
            name="comment"
            placeholder="Поставляем specialty-кофе из Латинской Америки, работаем по СКФО."
          />
        </FormField>
        <ConsentRow />
      </div>
    </LeadModal>
  );
}

export function LeadModalRoot({
  submitVacancyLead,
  submitEventLead,
  submitEducationLead,
  submitSupplierLead
}: LeadModalActions) {
  return (
    <>
      <VacancyLeadProvider action={submitVacancyLead} />
      <EventLeadProvider action={submitEventLead} />
      <EducationLeadProvider action={submitEducationLead} />
      <SupplierLeadProvider action={submitSupplierLead} />
    </>
  );
}
