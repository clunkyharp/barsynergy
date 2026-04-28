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
      description="Через этот блок можно отправить интерес к программе, запросить корпоративное обучение или оформить ручной заказ сертификата."
      enabled={enabled}
      result={result}
    >
      <div className="grid gap-6 xl:grid-cols-3">
        <form action={submitCourseApplication} className="border border-black/20 bg-white p-5">
          <HiddenUtmFields utm={utm} />
          <HoneypotField id="course-application-website" />
          <h3 className="text-lg font-semibold uppercase leading-7">Заявка на программу</h3>
          <div className="mt-5 grid gap-4">
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
              <Textarea id="courseGoals" name="goals" required className="min-h-32" maxLength={3000} minLength={10} />
            </FormField>
            <ConsentCheckboxField>
              Согласен на обработку персональных данных для обработки заявки. Текст{' '}
              <a className="font-semibold text-[var(--accent)] underline-offset-4 hover:underline" href="/legal/personal-data-consent">
                согласия
              </a>
              .
            </ConsentCheckboxField>
            <Button type="submit">Отправить заявку</Button>
          </div>
        </form>

        <form action={submitCorporateTrainingApplication} className="border border-black/20 bg-white p-5">
          <HiddenUtmFields utm={utm} />
          <HoneypotField id="corporate-training-website" />
          <h3 className="text-lg font-semibold uppercase leading-7">Корпоративное обучение</h3>
          <div className="mt-5 grid gap-4">
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
              <Textarea id="trainingRequest" name="requestDetails" required className="min-h-32" maxLength={4000} minLength={20} />
            </FormField>
            <ConsentCheckboxField>
              Согласен на обработку персональных данных для обработки заявки. Текст{' '}
              <a className="font-semibold text-[var(--accent)] underline-offset-4 hover:underline" href="/legal/personal-data-consent">
                согласия
              </a>
              .
            </ConsentCheckboxField>
            <Button type="submit">Отправить запрос</Button>
          </div>
        </form>

        <form action={submitCertificateOrderApplication} className="border border-black/20 bg-white p-5">
          <HiddenUtmFields utm={utm} />
          <HoneypotField id="certificate-order-website" />
          <h3 className="text-lg font-semibold uppercase leading-7">Заказ сертификата</h3>
          <div className="mt-5 grid gap-4">
            <FormField htmlFor="certificateCustomerName" label="Ваше имя">
              <Input id="certificateCustomerName" name="name" required maxLength={160} minLength={2} />
            </FormField>
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField htmlFor="certificateEmail" label="Email">
                <Input id="certificateEmail" name="email" type="email" maxLength={180} />
              </FormField>
              <FormField htmlFor="certificatePhone" label="Телефон">
                <Input id="certificatePhone" name="phone" maxLength={80} />
              </FormField>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
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
            </div>
            <FormField htmlFor="recipientName" label="Получатель сертификата">
              <Input id="recipientName" name="recipientName" required maxLength={160} minLength={2} />
            </FormField>
            <FormField htmlFor="certificateAmount" label="Номинал или сумма">
              <Input id="certificateAmount" name="amountLabel" required maxLength={120} minLength={1} />
            </FormField>
            <FormField htmlFor="certificateMessage" label="Комментарий">
              <Textarea id="certificateMessage" name="message" required className="min-h-32" maxLength={3000} minLength={10} />
            </FormField>
            <ConsentCheckboxField>
              Согласен на обработку персональных данных для обработки заявки. Текст{' '}
              <a className="font-semibold text-[var(--accent)] underline-offset-4 hover:underline" href="/legal/personal-data-consent">
                согласия
              </a>
              .
            </ConsentCheckboxField>
            <Button type="submit">Отправить заказ</Button>
          </div>
        </form>
      </div>
    </PublicApplicationSection>
  );
}
