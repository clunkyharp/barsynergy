import { submitContactMessage } from '@/app/(public)/contacts/actions';
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

export function ContactApplicationForm({ enabled, result, utm, cities }: PublicApplicationFormProps) {
  return (
    <PublicApplicationSection
      eyebrow="Контакты / Сообщение"
      title="Отправить сообщение команде"
      description="Форма для вопросов по обучению, событиям, партнерству, поставщикам и другим рабочим темам."
      enabled={enabled}
      result={result}
      disabledDescription="Форма сейчас недоступна. Для связи используйте email команды."
      disabledLink={{ href: 'mailto:hello@barsynergy.ru', label: 'Написать на email' }}
    >
      <form action={submitContactMessage} className="editorial-form-shell overflow-hidden">
        <HiddenUtmFields utm={utm} />
        <HoneypotField id="contact-message-website" />
        <PublicFormShellHeader
          eyebrow="Форма связи"
          title="Контактное сообщение"
          description="Для вопросов по обучению, событиям, партнерству и другим рабочим темам."
        />
        <div className="relative p-5 md:p-6">
          <div className="grid gap-4 md:grid-cols-2">
            <FormField htmlFor="contactName" label="Имя">
              <Input id="contactName" name="name" required maxLength={160} minLength={2} />
            </FormField>
            <FormField htmlFor="contactTopic" label="Тема">
              <Input id="contactTopic" name="topic" required maxLength={180} minLength={2} />
            </FormField>
            <FormField htmlFor="contactEmail" label="Email">
              <Input id="contactEmail" name="email" type="email" maxLength={180} />
            </FormField>
            <FormField htmlFor="contactPhone" label="Телефон">
              <Input id="contactPhone" name="phone" maxLength={80} />
            </FormField>
            <FormField htmlFor="contactTelegram" label="Telegram">
              <Input id="contactTelegram" name="telegram" maxLength={80} />
            </FormField>
            <FormField htmlFor="contactCityId" label="Город">
              <Select id="contactCityId" name="cityId" defaultValue="">
                <option value="">Не указан</option>
                {cities.map((city) => (
                  <option key={city.id} value={city.id}>
                    {city.name}
                  </option>
                ))}
              </Select>
            </FormField>
            <div className="md:col-span-2">
              <FormField htmlFor="contactMessage" label="Сообщение">
                <Textarea id="contactMessage" name="message" required className="min-h-40" maxLength={4000} minLength={20} />
              </FormField>
            </div>
            <div className="md:col-span-2">
              <ConsentCheckboxField>
                Согласен на обработку персональных данных для обработки сообщения. Текст{' '}
                <a className="font-semibold text-[var(--accent)] underline-offset-4 hover:underline" href="/legal/personal-data-consent">
                  согласия
                </a>
                .
              </ConsentCheckboxField>
            </div>
          </div>
          <PublicFormShellFooter note="Если нужна быстрая обратная связь, укажите удобный канал связи прямо в заявке.">
            <Button className="min-h-12 rounded-full px-6 tracking-[0.12em] sm:self-start" type="submit">
              Отправить сообщение
            </Button>
          </PublicFormShellFooter>
        </div>
      </form>
    </PublicApplicationSection>
  );
}
