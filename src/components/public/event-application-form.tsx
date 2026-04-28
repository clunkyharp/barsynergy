import { submitEventApplication } from '@/app/(public)/events/actions';
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

export function EventApplicationForm({ enabled, result, utm, cities }: PublicApplicationFormProps) {
  return (
    <PublicApplicationSection
      eyebrow="События / Заявка"
      title="Запрос на участие или предложение события"
      description="Оставьте заявку на участие в событии или кратко опишите формат, который хотите предложить команде."
      enabled={enabled}
      result={result}
    >
      <form action={submitEventApplication} className="editorial-form-shell overflow-hidden">
        <HiddenUtmFields utm={utm} />
        <HoneypotField id="event-application-website" />
        <PublicFormShellHeader
          eyebrow="Форма события"
          title="Заявка на событие"
          description="Для участия, предложения темы, коллаборации или нового формата в календаре."
        />
        <div className="relative p-5 md:p-6">
          <div className="grid gap-4 md:grid-cols-2">
            <FormField htmlFor="eventName" label="Имя">
              <Input id="eventName" name="name" required maxLength={160} minLength={2} />
            </FormField>
            <FormField htmlFor="eventTitle" label="Событие или тема">
              <Input id="eventTitle" name="eventTitle" required maxLength={180} minLength={2} />
            </FormField>
            <FormField htmlFor="eventEmail" label="Email">
              <Input id="eventEmail" name="email" type="email" maxLength={180} />
            </FormField>
            <FormField htmlFor="eventPhone" label="Телефон">
              <Input id="eventPhone" name="phone" maxLength={80} />
            </FormField>
            <FormField htmlFor="eventTelegram" label="Telegram">
              <Input id="eventTelegram" name="telegram" maxLength={80} />
            </FormField>
            <FormField htmlFor="eventCityId" label="Город">
              <Select id="eventCityId" name="cityId" defaultValue="">
                <option value="">Не указан</option>
                {cities.map((city) => (
                  <option key={city.id} value={city.id}>
                    {city.name}
                  </option>
                ))}
              </Select>
            </FormField>
            <div className="md:col-span-2">
              <FormField htmlFor="eventMessage" label="Комментарий">
                <Textarea id="eventMessage" name="message" required className="min-h-40" maxLength={3000} minLength={10} />
              </FormField>
            </div>
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
          <PublicFormShellFooter note="Если предлагаете свой формат, опишите площадку, тему и ожидаемый состав участников.">
            <Button className="min-h-12 rounded-full px-6 tracking-[0.12em] sm:self-start" type="submit">
              Отправить заявку
            </Button>
          </PublicFormShellFooter>
        </div>
      </form>
    </PublicApplicationSection>
  );
}
