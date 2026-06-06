'use client';

import { useEffect, useState, useActionState } from 'react';
import { submitVacancyPlacementApplication, submitVacancyResponseApplication } from '@/app/(public)/vacancies/actions';
import {
  ContactChannelFieldset,
  HiddenUtmFields,
  HoneypotField,
  PublicApplicationSection,
  PublicFormShellFooter,
  PublicFormShellHeader
} from '@/components/public/application-form-section';
import { AppLink } from '@/components/ui/app-link';
import { Button } from '@/components/ui/button';
import { ConsentField } from '@/components/ui/consent-field';
import { Dialog } from '@/components/ui/dialog';
import { EditorialShell } from '@/components/ui/editorial-shell';
import { FileUpload } from '@/components/ui/file-upload';
import { FormField, FormSection } from '@/components/ui/form-field';
import { Input } from '@/components/ui/input';
import { InlineLink } from '@/components/ui/inline-link';
import { Select } from '@/components/ui/select';
import { SubmitButton } from '@/components/ui/submit-button';
import { Textarea } from '@/components/ui/textarea';
import type { VacancyApplicationFormOptions } from '@/lib/public/content';
import { vacancyPositionValues } from '@/lib/vacancies/positions';

type SelectedVacancy = {
  id: string;
  slug?: string;
  title: string;
  companyName: string;
  cityName?: string;
};

type ProfilePrefill = {
  fullName?: string;
  cityId?: string;
  email?: string;
  phone?: string;
  telegram?: string;
};

type VacancyApplicationFormsProps = {
  enabled: boolean;
  options: VacancyApplicationFormOptions;
  result?: {
    type: 'success' | 'error';
    message: string;
  };
  utm: {
    source?: string;
    medium?: string;
    campaign?: string;
  };
};

function VacancyResponseForm({
  options,
  selectedVacancy,
  utm,
  profile,
  action
}: {
  options: VacancyApplicationFormOptions;
  selectedVacancy?: SelectedVacancy;
  utm: VacancyApplicationFormsProps['utm'];
  profile?: ProfilePrefill;
  action: (formData: FormData) => void;
}) {
  const hasVacancies = options.vacancies.length > 0;

  if (!selectedVacancy && !hasVacancies) {
    return (
      <EditorialShell className="p-5 md:p-6">
        <h3 className="text-xl font-semibold uppercase leading-7">Пока нет открытых вакансий</h3>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--muted)]">
          Открытых вакансий сейчас нет. Когда появятся новые роли, отклик будет на странице вакансии.
        </p>
        <div className="mt-5 flex flex-col gap-3 sm:flex-row">
          <Button className="rounded-[var(--radius-md)]" href="#vacancy-list" size="lg" variant="secondary">
            К вакансиям
          </Button>
          <Button className="rounded-[var(--radius-md)]" href="/contacts" size="lg">
            Связаться с нами
          </Button>
        </div>
      </EditorialShell>
    );
  }

  return (
    <form action={action} className="editorial-form-shell public-form-shell" id="vacancy-response-form">
      <HiddenUtmFields utm={utm} />
      <HoneypotField id="vacancy-response-website" />
      {selectedVacancy ? <input name="vacancyId" type="hidden" value={selectedVacancy.id} /> : null}
      {selectedVacancy?.slug ? <input name="returnPath" type="hidden" value={`/vacancies/${selectedVacancy.slug}`} /> : null}
      <PublicFormShellHeader
        eyebrow="Для кандидатов"
        title="Отклик на вакансию"
        description={
          selectedVacancy
            ? 'Оставьте контакт и пару слов о себе. Отклик будет привязан к этой вакансии.'
            : 'Выберите вакансию, оставьте контакт и пару слов о себе.'
        }
      />
      <div className="relative p-5 md:p-6">
        {!profile ? (
          <div className="mb-5 rounded-[var(--radius-md)] border border-[var(--accent)]/30 bg-[var(--accent-soft)] p-4 text-sm leading-6 text-[var(--text)]">
            <p className="font-semibold">Уже зарегистрированы?</p>
            <p className="mt-1 text-[var(--muted)]">
              <AppLink className="text-[var(--accent)] transition-colors hover:text-[var(--accent-strong)]" href={`/auth/login${selectedVacancy?.slug ? `?returnTo=/vacancies/${selectedVacancy.slug}` : ''}`}>
                Войдите
              </AppLink>
              {' '}или{' '}
              <AppLink className="text-[var(--accent)] transition-colors hover:text-[var(--accent-strong)]" href="/auth/register/user">
                зарегистрируйтесь
              </AppLink>
              , чтобы поля заполнились автоматически и отклик сохранился в истории.
            </p>
          </div>
        ) : !profile.fullName && !profile.phone && !profile.telegram ? (
          <div className="mb-5 rounded-[var(--radius-md)] border border-[var(--warning-border)] bg-[var(--warning-bg)] p-4 text-sm leading-6 text-[var(--text)]">
            <p className="font-semibold">Заполните профиль</p>
            <p className="mt-1 text-[var(--muted)]">
              Перейдите в <AppLink className="text-[var(--accent)] transition-colors hover:text-[var(--accent-strong)]" href="/profile/settings">настройки профиля</AppLink>, чтобы данные подставлялись автоматически.
            </p>
          </div>
        ) : null}
        {selectedVacancy ? (
          <EditorialShell className="mb-5 border-[var(--line)] bg-[var(--surface-wash)] p-4 shadow-none">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">Вы откликаетесь на</p>
            <p className="mt-2 text-base font-semibold leading-7 text-[var(--text)]">
              {selectedVacancy.title} / {selectedVacancy.companyName}
              {selectedVacancy.cityName ? ` / ${selectedVacancy.cityName}` : ''}
            </p>
          </EditorialShell>
        ) : (
          <FormField htmlFor="vacancyId" label="Вакансия">
            <Select id="vacancyId" name="vacancyId" required defaultValue="">
              <option value="">Выберите вакансию</option>
              {options.vacancies.map((vacancy) => (
                <option key={vacancy.id} value={vacancy.id}>
                  {vacancy.title} / {vacancy.companyName}
                  {vacancy.cityName ? ` / ${vacancy.cityName}` : ''}
                </option>
              ))}
            </Select>
          </FormField>
        )}
        <div className="mt-5 grid gap-6">
          <FormSection
            title="Контакт"
            description="Укажите имя и любой удобный канал связи. Достаточно email, телефона или Telegram."
          >
            <div className="grid gap-4 md:grid-cols-2">
              <FormField htmlFor="candidateName" label="Имя">
                <Input defaultValue={profile?.fullName ?? ''} id="candidateName" name="candidateName" placeholder="Иван Иванов" required maxLength={160} minLength={2} />
              </FormField>
              <FormField htmlFor="responseCityId" label="Город">
                <Select defaultValue={profile?.cityId ?? ''} id="responseCityId" name="cityId">
                  <option value="">Не указан</option>
                  {options.cities.map((city) => (
                    <option key={city.id} value={city.id}>
                      {city.name}
                    </option>
                  ))}
                </Select>
              </FormField>
            </div>
            <ContactChannelFieldset defaults={{ email: profile?.email, phone: profile?.phone, telegram: profile?.telegram }} emailId="responseEmail" phoneId="responsePhone" telegramId="responseTelegram" />
          </FormSection>

          <FormSection title="Опыт" description="Коротко опишите текущую роль и что важно сказать работодателю.">
            <FormField htmlFor="roleSummary" label="Опыт и текущая роль">
              <Textarea id="roleSummary" name="roleSummary" required maxLength={500} minLength={4} placeholder="Например: работал(а) барменом 2 года, делаю классику и авторские коктейли" />
            </FormField>
            <FormField htmlFor="responseMessage" label="Сообщение работодателю">
              <Textarea id="responseMessage" name="message" required className="min-h-40" maxLength={3000} minLength={10} placeholder="Например: могу выйти в смены по выходным, готов(а) к стажировке на следующей неделе." />
            </FormField>
          </FormSection>

          <FormSection title="Резюме" description="Можно оставить ссылку, приложить файл или использовать оба варианта.">
            <FormField htmlFor="resumeUrl" label="Ссылка на резюме">
              <Input id="resumeUrl" name="resumeUrl" maxLength={500} placeholder="https://example.ru/resume" type="url" />
            </FormField>
            <FormField
              htmlFor="resumeFile"
              label="Файл резюме"
              hint="PDF, DOC, DOCX, RTF или ODT. Максимальный размер — 8 МБ."
            >
              <FileUpload
                id="resumeFile"
                name="resumeFile"
                title="Приложить резюме"
                description="Выберите документ с резюме или оставьте поле пустым."
                meta="PDF, DOC, DOCX, RTF, ODT / до 8 МБ"
                privacy="private"
                privacyLabel="Резюме не публикуется на сайте и доступно команде только для проверки отклика."
                success="Резюме выбрано. Оно будет отправлено вместе с откликом."
                accept=".pdf,.doc,.docx,.rtf,.odt,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/rtf,text/rtf,application/vnd.oasis.opendocument.text"
              />
            </FormField>
          </FormSection>

          <ConsentField>
            Согласен с <InlineLink href="/legal/privacy">политикой обработки персональных данных</InlineLink> и даю{' '}
            <InlineLink href="/legal/personal-data-consent">согласие на обработку персональных данных</InlineLink>, включая передачу отклика работодателю после проверки.
          </ConsentField>
        </div>
        <PublicFormShellFooter>
          <SubmitButton className="rounded-[var(--radius-md)] sm:self-start" size="lg">
            Отправить отклик
          </SubmitButton>
        </PublicFormShellFooter>
      </div>
    </form>
  );
}

function VacancySubmissionForm({
  options,
  utm
}: {
  options: VacancyApplicationFormOptions;
  utm: VacancyApplicationFormsProps['utm'];
}) {
  return (
    <form action={submitVacancyPlacementApplication} className="editorial-form-shell public-form-shell" id="vacancy-submission-form">
      <HiddenUtmFields utm={utm} />
      <HoneypotField id="vacancy-submission-website" />
      <PublicFormShellHeader
        eyebrow="Для заведений"
        title="Разместить вакансию"
        description="Оставьте роль, условия и контакт. Если понадобится, детали уточним отдельно."
      />
      <div className="relative p-5 md:p-6">
        <div className="grid gap-4">
          <FormField htmlFor="companyName" label="Компания">
            <Input id="companyName" name="companyName" required maxLength={180} minLength={2} placeholder="Например, Coffee Point" />
          </FormField>
          <FormField htmlFor="contactName" label="Контактное лицо">
            <Input id="contactName" name="contactName" required maxLength={160} minLength={2} placeholder="Иван Иванов" />
          </FormField>
          <ContactChannelFieldset emailId="submissionEmail" phoneId="submissionPhone" telegramId="submissionTelegram" />
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField htmlFor="submissionCityId" label="Город">
              <Select id="submissionCityId" name="cityId" defaultValue="">
                <option value="">Не указан</option>
                {options.cities.map((city) => (
                  <option key={city.id} value={city.id}>
                    {city.name}
                  </option>
                ))}
              </Select>
            </FormField>
          </div>
          <FormField htmlFor="position" label="Позиция">
            <Select id="position" name="position" required defaultValue="">
              <option value="">Выберите позицию</option>
              {vacancyPositionValues.map((position) => (
                <option key={position} value={position}>
                  {position}
                </option>
              ))}
            </Select>
          </FormField>
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField htmlFor="employmentType" label="Формат">
              <Input id="employmentType" name="employmentType" maxLength={100} placeholder="Полная занятость" />
            </FormField>
            <FormField htmlFor="salaryLabel" label="Зарплата">
              <Input id="salaryLabel" name="salaryLabel" maxLength={120} placeholder="По договорённости" />
            </FormField>
          </div>
          <FormField htmlFor="experienceLabel" label="Опыт">
            <Input id="experienceLabel" name="experienceLabel" maxLength={120} placeholder="Например, от 1 года" />
          </FormField>
          <FormField htmlFor="shortDescription" label="Описание роли">
            <Textarea id="shortDescription" name="shortDescription" required maxLength={500} minLength={10} placeholder="Например: смены в баре, работа с гостями, классика и сезонные позиции." />
          </FormField>
          <FormField htmlFor="details" label="Требования">
            <Textarea id="details" name="details" required className="min-h-40" maxLength={4000} minLength={20} placeholder="Например: опыт работы с кофемашиной, аккуратность в сервисе, готовность к вечерним сменам." />
          </FormField>
          <ConsentField>
            Согласен с <InlineLink href="/legal/privacy">политикой обработки персональных данных</InlineLink> и даю{' '}
            <InlineLink href="/legal/personal-data-consent">согласие на обработку персональных данных</InlineLink> для этой заявки.
          </ConsentField>
        </div>
        <PublicFormShellFooter>
          <SubmitButton className="rounded-[var(--radius-md)] sm:self-start" size="lg">
            Отправить вакансию
          </SubmitButton>
        </PublicFormShellFooter>
      </div>
    </form>
  );
}

export function VacancyResponseDialog({
  options,
  selectedVacancy,
  utm,
  profile,
  enabled
}: {
  options: VacancyApplicationFormOptions;
  selectedVacancy: SelectedVacancy;
  utm: VacancyApplicationFormsProps['utm'];
  profile?: ProfilePrefill;
  enabled: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [state, formAction] = useActionState(submitVacancyResponseApplication, null);

  useEffect(() => {
    if (state?.type === 'success') {
      const t = setTimeout(() => setOpen(false), 2500);
      return () => clearTimeout(t);
    }
  }, [state]);

  if (!enabled) return null;

  return (
    <>
      <Button
        className="w-full min-w-0 justify-center rounded-[var(--radius-sm)] px-4 !whitespace-normal leading-5"
        onClick={() => setOpen(true)}
      >
        Откликнуться
      </Button>
      <Dialog
        open={open}
        onOpenChange={setOpen}
        title="Отклик на вакансию"
        size="lg"
      >
        {state?.type === 'success' ? (
          <div className="py-8 text-center">
            <p className="text-lg font-semibold">Отклик отправлен</p>
            <p className="mt-2 text-sm text-[var(--muted)]">Спасибо! Мы передадим вашу кандидатуру работодателю.</p>
          </div>
        ) : (
          <VacancyResponseForm
            action={formAction}
            options={options}
            selectedVacancy={selectedVacancy}
            utm={utm}
            profile={profile}
          />
        )}
      </Dialog>
    </>
  );
}

export function VacancyApplicationForms({
  enabled,
  options,
  result,
  utm
}: VacancyApplicationFormsProps) {
  return (
    <PublicApplicationSection
      eyebrow="Вакансии / Заявки"
      title="Разместить вакансию"
      description="Заполните роль, условия и контакты компании. После проверки подготовим вакансию к публикации."
      disclosureAliases={['applications', 'vacancy-submission', 'vacancy-forms']}
      disclosureClosedPanelClassName="max-w-2xl"
      disclosureFocusSelector="#companyName"
      disclosureId="submit-vacancy"
      disclosureOpenLabel="Заполнить вакансию"
      disclosureTitle="Заявка на публикацию"
      disclosureDescription="Укажите роль, город, график, условия, требования и контакт для отклика."
      introVariant="compact"
      enabled={enabled}
      result={result}
    >
      <div className="grid gap-6" id="vacancy-forms">
        <VacancySubmissionForm options={options} utm={utm} />
      </div>
    </PublicApplicationSection>
  );
}
