'use client';

import { useState } from 'react';
import { submitVacancyPlacementApplication, submitVacancyResponseApplication } from '@/app/(public)/vacancies/actions';
import {
  ConsentCheckboxField,
  HiddenUtmFields,
  HoneypotField,
  PublicApplicationSection,
  PublicFormShellFooter,
  PublicFormShellHeader
} from '@/components/public/application-form-section';
import { Button } from '@/components/ui/button';
import { FormField } from '@/components/ui/form-field';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import type { VacancyApplicationFormOptions } from '@/lib/public/content';
import { vacancyPositionValues } from '@/lib/vacancies/positions';
import { cn } from '@/lib/utils';

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

export function VacancyApplicationForms({ enabled, options, result, utm }: VacancyApplicationFormsProps) {
  const hasVacancies = options.vacancies.length > 0;
  const [mode, setMode] = useState<'submission' | 'response'>(hasVacancies ? 'response' : 'submission');

  return (
    <PublicApplicationSection
      eyebrow="Вакансии / Заявки"
      title="Выберите сценарий"
      description="Для заведений здесь есть отправка вакансии, для кандидатов — отдельный сценарий отклика только по опубликованным ролям."
      enabled={enabled}
      result={result}
    >
      <div className="grid gap-6" id="vacancy-forms">
        <div className="grid gap-3 md:grid-cols-2">
          <button
            className={cn(
              'rounded-[1.35rem] border px-4 py-4 text-left transition',
              mode === 'response'
                ? 'border-[var(--graphite)] bg-[var(--graphite)] text-white'
                : 'border-black/10 bg-white hover:border-[var(--accent)] hover:bg-[var(--surface)]'
            )}
            onClick={() => {
              if (hasVacancies) {
                setMode('response');
              }
            }}
            type="button"
          >
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] opacity-70">Для кандидатов</p>
            <p className="mt-2 text-base font-semibold leading-6">Откликнуться на вакансию</p>
            <p className={cn('mt-2 text-sm leading-6', mode === 'response' ? 'text-white/72' : 'text-[var(--muted)]')}>
              {hasVacancies
                ? 'Выберите открытую роль, добавьте контакт и короткий рассказ о вашем опыте.'
                : 'Отклик откроется автоматически, когда в списке появится хотя бы одна опубликованная вакансия.'}
            </p>
          </button>
          <button
            className={cn(
              'rounded-[1.35rem] border px-4 py-4 text-left transition',
              mode === 'submission'
                ? 'border-[var(--graphite)] bg-[var(--graphite)] text-white'
                : 'border-black/10 bg-white hover:border-[var(--accent)] hover:bg-[var(--surface)]'
            )}
            onClick={() => setMode('submission')}
            type="button"
          >
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] opacity-70">Для заведений</p>
            <p className="mt-2 text-base font-semibold leading-6">Разместить вакансию</p>
            <p className={cn('mt-2 text-sm leading-6', mode === 'submission' ? 'text-white/72' : 'text-[var(--muted)]')}>
              Отправьте роль, условия и детали. Заявка уйдёт на проверку и публикацию без лишних полей.
            </p>
          </button>
        </div>

        {mode === 'response' ? (
          hasVacancies ? (
            <form action={submitVacancyResponseApplication} className="editorial-form-shell overflow-hidden" id="vacancy-response">
              <HiddenUtmFields utm={utm} />
              <HoneypotField id="vacancy-response-website" />
              <PublicFormShellHeader
                eyebrow="Для кандидатов"
                title="Отклик на опубликованную вакансию"
                description="Сначала выберите роль из списка, затем оставьте контакт и короткое сообщение для работодателя."
              />
              <div className="relative p-5 md:p-6">
                <div className="grid gap-4">
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
                  <FormField htmlFor="candidateName" label="Имя кандидата">
                    <Input id="candidateName" name="candidateName" required maxLength={160} minLength={2} />
                  </FormField>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <FormField htmlFor="responseEmail" label="Email">
                      <Input id="responseEmail" name="email" maxLength={180} type="email" />
                    </FormField>
                    <FormField htmlFor="responsePhone" label="Телефон">
                      <Input id="responsePhone" name="phone" maxLength={80} />
                    </FormField>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <FormField htmlFor="responseTelegram" label="Telegram">
                      <Input id="responseTelegram" name="telegram" maxLength={80} />
                    </FormField>
                    <FormField htmlFor="responseCityId" label="Город">
                      <Select id="responseCityId" name="cityId" defaultValue="">
                        <option value="">Не указан</option>
                        {options.cities.map((city) => (
                          <option key={city.id} value={city.id}>
                            {city.name}
                          </option>
                        ))}
                      </Select>
                    </FormField>
                  </div>
                  <FormField htmlFor="roleSummary" label="Опыт или текущая роль">
                    <Textarea id="roleSummary" name="roleSummary" required maxLength={500} minLength={4} />
                  </FormField>
                  <FormField htmlFor="responseMessage" label="Сообщение работодателю">
                    <Textarea id="responseMessage" name="message" required className="min-h-40" maxLength={3000} minLength={10} />
                  </FormField>
                  <FormField htmlFor="resumeUrl" label="Ссылка на резюме">
                    <Input id="resumeUrl" name="resumeUrl" maxLength={500} type="url" />
                  </FormField>
                  <FormField
                    htmlFor="resumeFile"
                    label="Файл резюме"
                    hint="Поддерживаются PDF, DOC, DOCX, RTF и ODT. Можно оставить поле пустым, если уже приложили ссылку."
                  >
                    <Input
                      id="resumeFile"
                      name="resumeFile"
                      type="file"
                      accept=".pdf,.doc,.docx,.rtf,.odt,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/rtf,text/rtf,application/vnd.oasis.opendocument.text"
                    />
                  </FormField>
                  <ConsentCheckboxField>
                    Согласен на обработку данных и передачу отклика работодателю. Текст{' '}
                    <a className="font-semibold text-[var(--accent)] underline-offset-4 hover:underline" href="/legal/personal-data-consent">
                      согласия
                    </a>
                    .
                  </ConsentCheckboxField>
                </div>
                <PublicFormShellFooter note="Отклик отправляется только по опубликованной роли и сразу попадает в рабочую очередь на проверку.">
                  <Button className="min-h-12 rounded-full px-6 tracking-[0.12em] sm:self-start" type="submit">
                    Отправить отклик
                  </Button>
                </PublicFormShellFooter>
              </div>
            </form>
          ) : (
            <div className="editorial-form-shell p-5 md:p-6">
              <h3 className="text-xl font-semibold uppercase leading-7">Пока нет открытых вакансий</h3>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--muted)]">
                Как только в разделе появится опубликованная роль, здесь откроется форма отклика. Пока можно следить за
                разделом или написать команде напрямую.
              </p>
              <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                <Button className="rounded-full px-6 tracking-[0.08em]" href="#vacancy-list" variant="secondary">
                  Смотреть раздел
                </Button>
                <Button className="rounded-full px-6 tracking-[0.08em]" href="/contacts">
                  Написать команде
                </Button>
              </div>
            </div>
          )
        ) : (
          <form action={submitVacancyPlacementApplication} className="editorial-form-shell overflow-hidden" id="vacancy-submission">
          <HiddenUtmFields utm={utm} />
          <HoneypotField id="vacancy-submission-website" />
          <PublicFormShellHeader
            eyebrow="Для заведений"
            title="Разместить вакансию"
            description="Для заведений и компаний, которым нужно отправить позицию на проверку и публикацию."
          />
          <div className="relative p-5 md:p-6">
            <div className="grid gap-4">
              <FormField htmlFor="companyName" label="Компания">
                <Input id="companyName" name="companyName" required maxLength={180} minLength={2} />
              </FormField>
              <FormField htmlFor="contactName" label="Контактное лицо">
                <Input id="contactName" name="contactName" required maxLength={160} minLength={2} />
              </FormField>
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField htmlFor="submissionEmail" label="Email">
                  <Input id="submissionEmail" name="email" maxLength={180} type="email" />
                </FormField>
                <FormField htmlFor="submissionPhone" label="Телефон">
                  <Input id="submissionPhone" name="phone" maxLength={80} />
                </FormField>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField htmlFor="submissionTelegram" label="Telegram">
                  <Input id="submissionTelegram" name="telegram" maxLength={80} />
                </FormField>
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
                  <Input id="salaryLabel" name="salaryLabel" maxLength={120} placeholder="По договоренности" />
                </FormField>
              </div>
              <FormField htmlFor="experienceLabel" label="Опыт">
                <Input id="experienceLabel" name="experienceLabel" maxLength={120} />
              </FormField>
              <FormField htmlFor="shortDescription" label="Краткое описание">
                <Textarea id="shortDescription" name="shortDescription" required maxLength={500} minLength={10} />
              </FormField>
              <FormField htmlFor="details" label="Детали вакансии">
                <Textarea id="details" name="details" required className="min-h-40" maxLength={4000} minLength={20} />
              </FormField>
              <ConsentCheckboxField>
                Согласен на обработку персональных данных для обработки заявки. Текст{' '}
                <a className="font-semibold text-[var(--accent)] underline-offset-4 hover:underline" href="/legal/personal-data-consent">
                  согласия
                </a>
                .
              </ConsentCheckboxField>
            </div>
            <PublicFormShellFooter note="Чем точнее вы заполните описание, формат и зарплату, тем быстрее вакансия пройдет модерацию.">
              <Button className="min-h-12 rounded-full px-6 tracking-[0.12em] sm:self-start" type="submit">
                Отправить вакансию
              </Button>
            </PublicFormShellFooter>
          </div>
        </form>
        )}
      </div>
    </PublicApplicationSection>
  );
}
