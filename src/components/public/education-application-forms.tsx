import {
  submitCertificateOrderApplication,
  submitCorporateTrainingApplication,
  submitCourseApplication
} from '@/app/(public)/education/actions';
import {
  ConsentCheckboxField,
  HiddenUtmFields,
  HoneypotField,
  PublicApplicationSection,
  PublicFormShellFooter,
  PublicFormShellHeader,
  type PublicApplicationFormProps
} from '@/components/public/application-form-section';
import { Button } from '@/components/ui/button';
import { FormField } from '@/components/ui/form-field';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

export function EducationApplicationForms({ enabled, result, utm, cities }: PublicApplicationFormProps) {
  return (
    <PublicApplicationSection
      eyebrow="Образование / Заявки"
      title="Запросы на обучение"
      description="Здесь можно оставить заявку на программу, корпоративное обучение или сертификат."
      enabled={enabled}
      result={result}
    >
      <div className="grid grid-flow-dense gap-6 lg:grid-cols-2">
        <form action={submitCourseApplication} className="editorial-form-shell h-full overflow-hidden">
          <HiddenUtmFields utm={utm} />
          <HoneypotField id="course-application-website" />
          <PublicFormShellHeader
            eyebrow="Форма 01"
            title="Заявка на программу"
            description="Для индивидуального обучения, подбора темы или записи на ближайший поток."
          />
          <div className="relative p-5 md:p-6">
            <div className="grid gap-4">
              <FormField htmlFor="courseName" label="Имя">
                <Input id="courseName" name="name" required maxLength={160} minLength={2} />
              </FormField>
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField htmlFor="courseEmail" label="Email">
                  <Input id="courseEmail" name="email" type="email" maxLength={180} />
                </FormField>
                <FormField htmlFor="coursePhone" label="Телефон">
                  <Input id="coursePhone" name="phone" maxLength={80} />
                </FormField>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField htmlFor="courseTelegram" label="Telegram">
                  <Input id="courseTelegram" name="telegram" maxLength={80} />
                </FormField>
                <FormField htmlFor="courseCityId" label="Город">
                  <Select id="courseCityId" name="cityId" defaultValue="">
                    <option value="">Не указан</option>
                    {cities.map((city) => (
                      <option key={city.id} value={city.id}>
                        {city.name}
                      </option>
                    ))}
                  </Select>
                </FormField>
              </div>
              <FormField htmlFor="courseTitle" label="Интересующая программа или тема">
                <Input id="courseTitle" name="courseTitle" required maxLength={180} minLength={2} />
              </FormField>
              <FormField htmlFor="courseGoals" label="Комментарий">
                <Textarea id="courseGoals" name="goals" required className="min-h-36" maxLength={3000} minLength={10} />
              </FormField>
              <ConsentCheckboxField>
                Согласен на обработку персональных данных для обработки заявки. Текст{' '}
                <a className="font-semibold text-[var(--accent)] underline-offset-4 hover:underline" href="/legal/personal-data-consent">
                  согласия
                </a>
                .
              </ConsentCheckboxField>
            </div>
            <PublicFormShellFooter note="Используйте форму, если хотите обсудить программу или подобрать тему под свой запрос.">
              <Button className="min-h-12 rounded-full px-6 tracking-[0.12em] sm:self-start" type="submit">
                Отправить заявку
              </Button>
            </PublicFormShellFooter>
          </div>
        </form>

        <form action={submitCorporateTrainingApplication} className="editorial-form-shell h-full overflow-hidden">
          <HiddenUtmFields utm={utm} />
          <HoneypotField id="corporate-training-website" />
          <PublicFormShellHeader
            eyebrow="Форма 02"
            title="Корпоративное обучение"
            description="Для заведений и команд, которым нужен обучающий формат под конкретную задачу."
          />
          <div className="relative p-5 md:p-6">
            <div className="grid gap-4">
              <FormField htmlFor="trainingCompanyName" label="Компания">
                <Input id="trainingCompanyName" name="companyName" required maxLength={180} minLength={2} />
              </FormField>
              <FormField htmlFor="trainingContactName" label="Контактное лицо">
                <Input id="trainingContactName" name="contactName" required maxLength={160} minLength={2} />
              </FormField>
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField htmlFor="trainingEmail" label="Email">
                  <Input id="trainingEmail" name="email" type="email" maxLength={180} />
                </FormField>
                <FormField htmlFor="trainingPhone" label="Телефон">
                  <Input id="trainingPhone" name="phone" maxLength={80} />
                </FormField>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField htmlFor="trainingTelegram" label="Telegram">
                  <Input id="trainingTelegram" name="telegram" maxLength={80} />
                </FormField>
                <FormField htmlFor="trainingCityId" label="Город">
                  <Select id="trainingCityId" name="cityId" defaultValue="">
                    <option value="">Не указан</option>
                    {cities.map((city) => (
                      <option key={city.id} value={city.id}>
                        {city.name}
                      </option>
                    ))}
                  </Select>
                </FormField>
              </div>
              <FormField htmlFor="trainingTeamSize" label="Размер команды">
                <Input id="trainingTeamSize" name="teamSize" required maxLength={80} minLength={1} />
              </FormField>
              <FormField htmlFor="trainingRequest" label="Запрос">
                <Textarea id="trainingRequest" name="requestDetails" required className="min-h-36" maxLength={4000} minLength={20} />
              </FormField>
              <ConsentCheckboxField>
                Согласен на обработку персональных данных для обработки заявки. Текст{' '}
                <a className="font-semibold text-[var(--accent)] underline-offset-4 hover:underline" href="/legal/personal-data-consent">
                  согласия
                </a>
                .
              </ConsentCheckboxField>
            </div>
            <PublicFormShellFooter note="Подходит для обучения команды, запуска новой карты или внутреннего интенсива.">
              <Button className="min-h-12 rounded-full px-6 tracking-[0.12em] sm:self-start" type="submit">
                Отправить запрос
              </Button>
            </PublicFormShellFooter>
          </div>
        </form>

        <form action={submitCertificateOrderApplication} className="editorial-form-shell h-full overflow-hidden lg:col-span-2">
          <HiddenUtmFields utm={utm} />
          <HoneypotField id="certificate-order-website" />
          <PublicFormShellHeader
            eyebrow="Форма 03"
            title="Заказ сертификата"
            description="Для подарочного сертификата, номинала или персонального комментария к заказу."
          />
          <div className="relative p-5 md:p-6">
            <div className="grid gap-4 md:grid-cols-2">
              <FormField htmlFor="certificateCustomerName" label="Ваше имя">
                <Input id="certificateCustomerName" name="name" required maxLength={160} minLength={2} />
              </FormField>
              <FormField htmlFor="recipientName" label="Получатель сертификата">
                <Input id="recipientName" name="recipientName" required maxLength={160} minLength={2} />
              </FormField>
              <FormField htmlFor="certificateEmail" label="Email">
                <Input id="certificateEmail" name="email" type="email" maxLength={180} />
              </FormField>
              <FormField htmlFor="certificatePhone" label="Телефон">
                <Input id="certificatePhone" name="phone" maxLength={80} />
              </FormField>
              <FormField htmlFor="certificateTelegram" label="Telegram">
                <Input id="certificateTelegram" name="telegram" maxLength={80} />
              </FormField>
              <FormField htmlFor="certificateCityId" label="Город">
                <Select id="certificateCityId" name="cityId" defaultValue="">
                  <option value="">Не указан</option>
                  {cities.map((city) => (
                    <option key={city.id} value={city.id}>
                      {city.name}
                    </option>
                  ))}
                </Select>
              </FormField>
              <FormField htmlFor="certificateAmount" label="Номинал или сумма">
                <Input id="certificateAmount" name="amountLabel" required maxLength={120} minLength={1} />
              </FormField>
              <FormField className="md:col-span-2" htmlFor="certificateMessage" label="Комментарий">
                <Textarea id="certificateMessage" name="message" required className="min-h-36" maxLength={3000} minLength={10} />
              </FormField>
              <div className="md:col-span-2">
                <ConsentCheckboxField>
                  Согласен на обработку персональных данных для обработки заявки. Текст{' '}
                  <a className="font-semibold text-[var(--accent)] underline-offset-4 hover:underline" href="/legal/personal-data-consent">
                    согласия
                  </a>
                  .
                </ConsentCheckboxField>
              </div>
            </div>
            <PublicFormShellFooter
              className="md:items-center"
              note="Если нужен корпоративный сертификат или нестандартный формат, укажите это в комментарии."
            >
              <Button className="min-h-12 rounded-full px-6 tracking-[0.12em] sm:self-start" type="submit">
                Отправить заказ
              </Button>
            </PublicFormShellFooter>
          </div>
        </form>
      </div>
    </PublicApplicationSection>
  );
}
