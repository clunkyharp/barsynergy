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

  return (
    <PublicApplicationSection
      eyebrow="Вакансии / Заявки"
      title="Заявки по вакансиям"
      description="Здесь можно отправить вакансию от заведения или откликнуться на подходящую позицию."
      enabled={enabled}
      result={result}
    >
      <div className="grid grid-flow-dense gap-6 lg:grid-cols-2">
        <form action={submitVacancyPlacementApplication} className="editorial-form-shell h-full overflow-hidden" id="vacancy-submission">
          <HiddenUtmFields utm={utm} />
          <HoneypotField id="vacancy-submission-website" />
          <PublicFormShellHeader
            eyebrow="Форма 01"
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

        <form action={submitVacancyResponseApplication} className="editorial-form-shell h-full overflow-hidden" id="vacancy-response">
          <HiddenUtmFields utm={utm} />
          <HoneypotField id="vacancy-response-website" />
          <PublicFormShellHeader
            eyebrow="Форма 02"
            title="Откликнуться на вакансию"
            description="Для кандидатов, которые хотят отправить отклик на уже опубликованную позицию."
          />
          <div className="relative p-5 md:p-6">
            <div className="grid gap-4">
              <FormField htmlFor="vacancyId" label="Вакансия">
                <Select id="vacancyId" name="vacancyId" required disabled={!hasVacancies} defaultValue="">
                  <option value="">Выберите вакансию</option>
                  {options.vacancies.map((vacancy) => (
                    <option key={vacancy.id} value={vacancy.id}>
                      {vacancy.title} / {vacancy.companyName}
                      {vacancy.cityName ? ` / ${vacancy.cityName}` : ''}
                    </option>
                  ))}
                </Select>
              </FormField>
              {!hasVacancies ? (
                <p className="rounded-[1rem] border border-black/10 bg-[rgba(255,255,255,0.58)] px-4 py-3 text-sm leading-6 text-[var(--muted)]">
                  Отклик станет доступен, когда в разделе появятся вакансии.
                </p>
              ) : null}
              <FormField htmlFor="candidateName" label="Имя кандидата">
                <Input id="candidateName" name="candidateName" required maxLength={160} minLength={2} disabled={!hasVacancies} />
              </FormField>
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField htmlFor="responseEmail" label="Email">
                  <Input id="responseEmail" name="email" maxLength={180} type="email" disabled={!hasVacancies} />
                </FormField>
                <FormField htmlFor="responsePhone" label="Телефон">
                  <Input id="responsePhone" name="phone" maxLength={80} disabled={!hasVacancies} />
                </FormField>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField htmlFor="responseTelegram" label="Telegram">
                  <Input id="responseTelegram" name="telegram" maxLength={80} disabled={!hasVacancies} />
                </FormField>
                <FormField htmlFor="responseCityId" label="Город">
                  <Select id="responseCityId" name="cityId" defaultValue="" disabled={!hasVacancies}>
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
                <Textarea id="roleSummary" name="roleSummary" required maxLength={500} minLength={4} disabled={!hasVacancies} />
              </FormField>
              <FormField htmlFor="responseMessage" label="Сообщение работодателю">
                <Textarea
                  id="responseMessage"
                  name="message"
                  required
                  className="min-h-40"
                  maxLength={3000}
                  minLength={10}
                  disabled={!hasVacancies}
                />
              </FormField>
              <FormField htmlFor="resumeUrl" label="Ссылка на резюме">
                <Input id="resumeUrl" name="resumeUrl" maxLength={500} type="url" disabled={!hasVacancies} />
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
                  disabled={!hasVacancies}
                />
              </FormField>
              <ConsentCheckboxField disabled={!hasVacancies}>
                Согласен на обработку данных и передачу отклика работодателю. Текст{' '}
                <a className="font-semibold text-[var(--accent)] underline-offset-4 hover:underline" href="/legal/personal-data-consent">
                  согласия
                </a>
                .
              </ConsentCheckboxField>
            </div>
            <PublicFormShellFooter note="Если вакансий пока нет, форма автоматически останется неактивной до публикации первой позиции.">
              <Button className="min-h-12 rounded-full px-6 tracking-[0.12em] sm:self-start" type="submit" disabled={!hasVacancies}>
                Отправить отклик
              </Button>
            </PublicFormShellFooter>
          </div>
        </form>
      </div>
    </PublicApplicationSection>
  );
}
