'use client';

import { useEffect, useState } from 'react';
import { LeadModal } from '@/components/public/modals/lead-modal';
import { subscribeLeadModal } from '@/lib/public/lead-modal-bus';
import { FormField } from '@/components/ui/form-field';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import {
  ConsentRow,
  EducationLeadProvider,
  EventLeadProvider,
  VacancyLeadProvider,
  type LeadAction
} from '@/components/public/lead-modal-forms';

export type LeadModalActions = {
  submitVacancyLead: LeadAction;
  submitEventLead: LeadAction;
  submitEducationLead: LeadAction;
  submitSupplierLead: LeadAction;
  submitMasterLead: LeadAction;
};

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

function MasterLeadProvider({ action }: { action: LeadAction }) {
  const [open, setOpen] = useState(false);
  useEffect(() => subscribeLeadModal('master', () => setOpen(true)), []);

  return (
    <LeadModal
      action={action}
      description="Расскажите о своих услугах — команда проверит заявку и свяжется с вами."
      onOpenChange={setOpen}
      open={open}
      title="Стать мастером"
      submitLabel="Отправить заявку"
    >
      <div className="flex flex-col gap-4">
        <FormField htmlFor="mst-entity" label="Тип профиля">
          <Select defaultValue="INDIVIDUAL" id="mst-entity" name="entityType">
            <option value="INDIVIDUAL">Частный мастер</option>
            <option value="BUSINESS">Компания</option>
          </Select>
        </FormField>
        <FormField htmlFor="mst-title" label="Название профиля">
          <Input
            id="mst-title"
            maxLength={180}
            minLength={2}
            name="title"
            placeholder="Например, запуск бара и обучение команды"
            required
          />
        </FormField>
        <FormField htmlFor="mst-specializations" label="Специализации">
          <Input
            id="mst-specializations"
            maxLength={300}
            minLength={2}
            name="specializations"
            placeholder="Запуск, обучение, сервис оборудования"
            required
          />
        </FormField>
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField htmlFor="mst-city" label="Город">
            <Input
              autoComplete="address-level2"
              id="mst-city"
              maxLength={120}
              name="city"
              placeholder="Махачкала"
            />
          </FormField>
          <FormField htmlFor="mst-contact" label="Контакт">
            <Input
              autoComplete="tel"
              id="mst-contact"
              maxLength={200}
              minLength={2}
              name="contact"
              placeholder="+7 999 123-45-67 или email"
              required
            />
          </FormField>
        </div>
        <FormField
          htmlFor="mst-comment"
          hint="Опишите услуги, опыт и географию работы."
          label="О себе"
        >
          <Textarea
            className="min-h-24"
            id="mst-comment"
            maxLength={4000}
            name="comment"
            placeholder="Запускаю кофейни под ключ, обучаю команды бариста. Работаю по всему СКФО."
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
  submitSupplierLead,
  submitMasterLead
}: LeadModalActions) {
  return (
    <>
      <VacancyLeadProvider action={submitVacancyLead} />
      <EventLeadProvider action={submitEventLead} />
      <EducationLeadProvider action={submitEducationLead} />
      <SupplierLeadProvider action={submitSupplierLead} />
      <MasterLeadProvider action={submitMasterLead} />
    </>
  );
}
