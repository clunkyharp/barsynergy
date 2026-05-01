import { submitContactMessage } from '@/app/(public)/contacts/actions';
import {
  HiddenUtmFields,
  HoneypotField,
  PublicApplicationSection,
  PublicFormShellFooter,
  PublicFormShellHeader,
  type PublicApplicationFormProps
} from '@/components/public/application-form-section';
import { Button } from '@/components/ui/button';
import { ConsentField } from '@/components/ui/consent-field';
import { FormField } from '@/components/ui/form-field';
import { Input } from '@/components/ui/input';
import { InlineLink } from '@/components/ui/inline-link';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

const contactTopicOptions = [
  'Предложить образовательный формат',
  'Добавить событие',
  'Разместить вакансию',
  'Добавить поставщика',
  'Обсудить партнёрство',
  'Обсудить спонсорство',
  'Предложить материал',
  'Другое'
] as const;

export function ContactApplicationForm({ enabled, result, utm, cities, defaultTopic }: PublicApplicationFormProps) {
  return (
    <PublicApplicationSection
      eyebrow="Контакты / Сообщение"
      title="Написать команде"
      description="Вопросы по обучению, событиям, партнёрствам, вакансиям и поставщикам."
      enabled={enabled}
      result={result}
      disabledDescription="Форма сейчас недоступна. Если вопрос срочный, напишите на email команды."
      disabledLink={{ href: 'mailto:hello@barsynergy.ru', label: 'Написать на почту' }}
    >
      <form action={submitContactMessage} className="editorial-form-shell overflow-hidden">
        <HiddenUtmFields utm={utm} />
        <HoneypotField id="contact-message-website" />
        <PublicFormShellHeader
          eyebrow="Сообщение"
          title="О чём хотите написать"
          description="Коротко опишите вопрос, задачу или идею."
        />
        <div className="relative p-5 md:p-6">
          <div className="grid gap-4 md:grid-cols-2">
            <FormField htmlFor="contactName" label="Имя">
              <Input id="contactName" name="name" required maxLength={160} minLength={2} />
            </FormField>
            <FormField htmlFor="contactTopic" label="Тема">
              <Select id="contactTopic" name="topic" defaultValue={defaultTopic ?? ''} required>
                <option value="" disabled>
                  Выберите тему обращения
                </option>
                {contactTopicOptions.map((topic) => (
                  <option key={topic} value={topic}>
                    {topic}
                  </option>
                ))}
              </Select>
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
              <ConsentField>
                Даю согласие на обработку персональных данных, чтобы команда могла ответить на сообщение. Полный текст{' '}
                <InlineLink href="/legal/personal-data-consent">согласия</InlineLink>
                .
              </ConsentField>
            </div>
          </div>
          <PublicFormShellFooter note="Если хотите получить ответ быстрее, оставьте удобный способ связи.">
            <Button className="min-h-12 rounded-full px-6 tracking-[0.12em] sm:self-start" type="submit">
              Отправить сообщение
            </Button>
          </PublicFormShellFooter>
        </div>
      </form>
    </PublicApplicationSection>
  );
}
