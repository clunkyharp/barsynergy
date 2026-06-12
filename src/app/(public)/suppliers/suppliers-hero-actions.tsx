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
import { submitSupplierLead } from '@/app/(public)/suppliers/actions';

export function SuppliersHeroActions() {
  const [leadOpen, setLeadOpen] = useState(false);
  const [infoOpen, setInfoOpen] = useState(false);

  return (
    <>
      <HeroActions
        primaryLabel="Добавить компанию"
        secondaryLabel="Как стать поставщиком?"
        onPrimaryClick={() => setLeadOpen(true)}
        onSecondaryClick={() => setInfoOpen(true)}
      />

      <LeadModal
        action={submitSupplierLead}
        description="Оставьте данные поставщика — команда проверит информацию и свяжется с вами."
        onOpenChange={setLeadOpen}
        open={leadOpen}
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
        title="Как стать поставщиком?"
        ctaLabel="Добавить компанию"
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
                Вы отправляете данные компании
              </p>
              <p className="mt-0.5 text-sm leading-6 text-[var(--muted)]">
                Заполните форму с названием, категорией и контактами.
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--accent)] text-[11px] font-bold text-[var(--accent-contrast)]">
              2
            </span>
            <div>
              <p className={`${displayFont.className} text-sm font-semibold text-[var(--text)]`}>
                Команда проверяет профиль
              </p>
              <p className="mt-0.5 text-sm leading-6 text-[var(--muted)]">
                Мы сверяем данные и связываемся для уточнения.
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--accent)] text-[11px] font-bold text-[var(--accent-contrast)]">
              3
            </span>
            <div>
              <p className={`${displayFont.className} text-sm font-semibold text-[var(--text)]`}>
                Карточка появляется в каталоге
              </p>
              <p className="mt-0.5 text-sm leading-6 text-[var(--muted)]">
                После проверки компания становится видна в каталоге поставщиков.
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--accent)] text-[11px] font-bold text-[var(--accent-contrast)]">
              4
            </span>
            <div>
              <p className={`${displayFont.className} text-sm font-semibold text-[var(--text)]`}>
                Клиенты могут связаться с вами
              </p>
              <p className="mt-0.5 text-sm leading-6 text-[var(--muted)]">
                Потенциальные заказчики видят контакты и пишут напрямую.
              </p>
            </div>
          </div>
        </div>
      </InfoModal>
    </>
  );
}
