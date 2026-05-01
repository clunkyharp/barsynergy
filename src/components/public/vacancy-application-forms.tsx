'use client';

import { useState } from 'react';
import { submitVacancyPlacementApplication, submitVacancyResponseApplication } from '@/app/(public)/vacancies/actions';
import {
  HiddenUtmFields,
  HoneypotField,
  PublicApplicationSection,
  PublicFormShellFooter,
  PublicFormShellHeader
} from '@/components/public/application-form-section';
import { Button } from '@/components/ui/button';
import { ConsentField } from '@/components/ui/consent-field';
import { EditorialShell } from '@/components/ui/editorial-shell';
import { FormField } from '@/components/ui/form-field';
import { Input } from '@/components/ui/input';
import { InlineLink } from '@/components/ui/inline-link';
import { Select } from '@/components/ui/select';
import { SegmentedControl } from '@/components/ui/segmented-control';
import { Textarea } from '@/components/ui/textarea';
import type { VacancyApplicationFormOptions } from '@/lib/public/content';
import { vacancyPositionValues } from '@/lib/vacancies/positions';

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
      title="Отклик и размещение"
      description="Здесь можно откликнуться на вакансию или отправить свою на публикацию."
      enabled={enabled}
      result={result}
    >
      <div className="grid gap-6" id="vacancy-forms">
        <SegmentedControl
          items={[
            {
              value: 'response',
              eyebrow: 'Для кандидатов',
              label: 'Откликнуться на вакансию',
              description: hasVacancies ? 'Открытые вакансии из списка ниже.' : 'Форма появится, когда в разделе будут новые вакансии.',
              disabled: !hasVacancies
            },
            {
              value: 'submission',
              eyebrow: 'Для заведений',
              label: 'Разместить вакансию',
              description: 'Роль, условия и контакт для связи.'
            }
          ]}
          onChange={setMode}
          value={mode}
        />

        {mode === 'response' ? (
          hasVacancies ? (
            <form action={submitVacancyResponseApplication} className="editorial-form-shell overflow-hidden" id="vacancy-response">
              <HiddenUtmFields utm={utm} />
              <HoneypotField id="vacancy-response-website" />
              <PublicFormShellHeader
                eyebrow="Для кандидатов"
                title="Отклик на вакансию"
                description="Выберите вакансию, оставьте контакт и пару слов о себе."
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
                  <FormField htmlFor="candidateName" label="Имя">
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
                  <FormField htmlFor="roleSummary" label="Опыт и текущая роль">
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
                    hint="Поддерживаются PDF, DOC, DOCX, RTF и ODT. Можно приложить файл или оставить ссылку выше."
                  >
                    <Input
                      id="resumeFile"
                      name="resumeFile"
                      type="file"
                      accept=".pdf,.doc,.docx,.rtf,.odt,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/rtf,text/rtf,application/vnd.oasis.opendocument.text"
                    />
                  </FormField>
                  <ConsentField>
                    Даю согласие на обработку данных и передачу отклика работодателю. Полный текст{' '}
                    <InlineLink href="/legal/personal-data-consent">согласия</InlineLink>.
                  </ConsentField>
                </div>
                <PublicFormShellFooter>
                  <Button className="rounded-full sm:self-start" size="lg" type="submit">
                    Отправить отклик
                  </Button>
                </PublicFormShellFooter>
              </div>
            </form>
          ) : (
            <EditorialShell className="p-5 md:p-6">
              <h3 className="text-xl font-semibold uppercase leading-7">Пока нет открытых вакансий</h3>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--muted)]">
                Сейчас открытых вакансий нет. Как только они появятся, отклик станет доступен здесь. Пока можно следить за разделом
                или написать команде.
              </p>
              <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                <Button className="rounded-full" href="#vacancy-list" size="lg" variant="secondary">
                  Смотреть раздел
                </Button>
                <Button className="rounded-full" href="/contacts" size="lg">
                  Написать команде
                </Button>
              </div>
            </EditorialShell>
          )
        ) : (
          <form action={submitVacancyPlacementApplication} className="editorial-form-shell overflow-hidden" id="vacancy-submission">
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
                  <Input id="salaryLabel" name="salaryLabel" maxLength={120} placeholder="По договорённости" />
                </FormField>
              </div>
              <FormField htmlFor="experienceLabel" label="Опыт">
                <Input id="experienceLabel" name="experienceLabel" maxLength={120} />
              </FormField>
              <FormField htmlFor="shortDescription" label="Описание роли">
                <Textarea id="shortDescription" name="shortDescription" required maxLength={500} minLength={10} />
              </FormField>
              <FormField htmlFor="details" label="Что важно знать о вакансии">
                <Textarea id="details" name="details" required className="min-h-40" maxLength={4000} minLength={20} />
              </FormField>
              <ConsentField>
                Даю согласие на обработку персональных данных для этой заявки. Полный текст{' '}
                <InlineLink href="/legal/personal-data-consent">согласия</InlineLink>.
              </ConsentField>
            </div>
            <PublicFormShellFooter>
              <Button className="rounded-full sm:self-start" size="lg" type="submit">
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
