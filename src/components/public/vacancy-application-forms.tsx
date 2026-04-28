import { submitVacancyPlacementApplication, submitVacancyResponseApplication } from '@/app/(public)/vacancies/actions';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { FormField } from '@/components/ui/form-field';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { displayFont } from '@/lib/fonts';
import type { VacancyApplicationFormOptions } from '@/lib/public/content';

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

function HiddenUtmFields({ utm }: { utm: VacancyApplicationFormsProps['utm'] }) {
  return (
    <>
      <input name="utmSource" type="hidden" value={utm.source ?? ''} />
      <input name="utmMedium" type="hidden" value={utm.medium ?? ''} />
      <input name="utmCampaign" type="hidden" value={utm.campaign ?? ''} />
    </>
  );
}

function HoneypotField({ id }: { id: string }) {
  return (
    <div aria-hidden="true" className="hidden">
      <label htmlFor={id}>Сайт</label>
      <input id={id} name="website" tabIndex={-1} type="text" autoComplete="off" />
    </div>
  );
}

export function VacancyApplicationForms({ enabled, options, result, utm }: VacancyApplicationFormsProps) {
  const hasVacancies = options.vacancies.length > 0;

  return (
    <section className="border-b border-black/20 bg-[var(--surface)] py-10 md:py-14" id="applications">
      <div className="container grid gap-8 xl:grid-cols-[0.58fr_1.42fr]">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--accent)]">Вакансии / Заявки</p>
          <h2 className={`${displayFont.className} display-tight mt-3 text-[44px] md:text-[58px]`}>
            Заявки по вакансиям
          </h2>
          <p className="mt-5 max-w-md text-sm leading-7 text-[var(--muted)]">
            Отправьте вакансию для проверки или отклик на опубликованную позицию. Отклики проходят ручную проверку
            перед передачей работодателю.
          </p>
          {result ? (
            <div
              className={
                result.type === 'error'
                  ? 'mt-6 border border-[var(--danger)] bg-[var(--danger)]/5 p-4 text-sm text-[var(--danger)]'
                  : 'mt-6 border border-[var(--success)] bg-[var(--success)]/5 p-4 text-sm text-[var(--success)]'
              }
            >
              {result.message}
            </div>
          ) : null}
        </div>

        {!enabled ? (
          <div className="border border-black/20 bg-white p-5">
            <h3 className="text-lg font-semibold uppercase leading-7">Заявки временно закрыты</h3>
            <p className="mt-3 text-sm leading-7 text-[var(--muted)]">
              До утверждения юридических текстов заявки принимаются только через контактный раздел.
            </p>
            <Button className="mt-5" href="/contacts" variant="secondary">
              Перейти в контакты
            </Button>
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-2">
            <form
              action={submitVacancyPlacementApplication}
              className="border border-black/20 bg-white p-5"
              id="vacancy-submission"
            >
              <HiddenUtmFields utm={utm} />
              <HoneypotField id="vacancy-submission-website" />
              <h3 className="text-lg font-semibold uppercase leading-7">Разместить вакансию</h3>
              <div className="mt-5 grid gap-4">
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
                  <Input id="position" name="position" required maxLength={180} minLength={2} />
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
                <FormField htmlFor="details" label="Детали для редакции">
                  <Textarea id="details" name="details" required className="min-h-36" maxLength={4000} minLength={20} />
                </FormField>
                <label className="flex items-start gap-3 text-sm leading-6 text-[var(--muted)]">
                  <Checkbox name="consent" required value="accepted" />
                  <span>
                    Согласен на обработку персональных данных для обработки заявки. Текст{' '}
                    <a
                      className="font-semibold text-[var(--accent)] underline-offset-4 hover:underline"
                      href="/legal/personal-data-consent"
                    >
                      согласия
                    </a>
                    .
                  </span>
                </label>
                <Button type="submit">Отправить вакансию</Button>
              </div>
            </form>

            <form action={submitVacancyResponseApplication} className="border border-black/20 bg-white p-5" id="vacancy-response">
              <HiddenUtmFields utm={utm} />
              <HoneypotField id="vacancy-response-website" />
              <h3 className="text-lg font-semibold uppercase leading-7">Откликнуться на вакансию</h3>
              <div className="mt-5 grid gap-4">
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
                  <p className="text-sm text-[var(--muted)]">Отклик станет доступен после публикации первой вакансии.</p>
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
                    className="min-h-36"
                    maxLength={3000}
                    minLength={10}
                    disabled={!hasVacancies}
                  />
                </FormField>
                <FormField htmlFor="resumeUrl" label="Ссылка на резюме">
                  <Input id="resumeUrl" name="resumeUrl" maxLength={500} type="url" disabled={!hasVacancies} />
                </FormField>
                <label className="flex items-start gap-3 text-sm leading-6 text-[var(--muted)]">
                  <Checkbox name="consent" required value="accepted" disabled={!hasVacancies} />
                  <span>
                    Согласен на обработку данных и передачу отклика работодателю после проверки BARSYNERGY. Текст{' '}
                    <a
                      className="font-semibold text-[var(--accent)] underline-offset-4 hover:underline"
                      href="/legal/personal-data-consent"
                    >
                      согласия
                    </a>
                    .
                  </span>
                </label>
                <Button type="submit" disabled={!hasVacancies}>
                  Отправить отклик
                </Button>
              </div>
            </form>
          </div>
        )}
      </div>
    </section>
  );
}
