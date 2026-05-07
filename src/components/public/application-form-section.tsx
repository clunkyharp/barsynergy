import { PublicBodyText, PublicDisplayTitle, PublicEyebrow } from '@/components/public/public-primitives';
import { RequestDisclosure } from '@/components/public/request-disclosure';
import { Button } from '@/components/ui/button';
import { EditorialShell } from '@/components/ui/editorial-shell';
import { FormField } from '@/components/ui/form-field';
import { InlineAlert } from '@/components/ui/inline-alert';
import { Input } from '@/components/ui/input';
import type { ApplicationCityOption } from '@/lib/applications/form-options';
import type { PublicApplicationResult, PublicApplicationUtm } from '@/lib/applications/public-form-helpers';
import { cn } from '@/lib/utils';

type PublicApplicationSectionProps = {
  eyebrow: string;
  title: string;
  description: string;
  enabled: boolean;
  result?: PublicApplicationResult;
  children: React.ReactNode;
  disabledDescription?: string;
  disabledLink?: {
    href: string;
    label: string;
  };
  disclosureAliases?: string[];
  disclosureClosedContent?: React.ReactNode;
  disclosureDefaultOpen?: boolean;
  disclosureDescription?: string;
  disclosureFocusSelector?: string;
  disclosureId?: string;
  disclosureOpenLabel?: string;
  disclosureShowDefaultTrigger?: boolean;
  disclosureTitle?: string;
  introVariant?: 'side' | 'compact';
  sectionId?: string;
};

export type PublicApplicationFormProps = {
  enabled: boolean;
  result?: PublicApplicationResult;
  utm: PublicApplicationUtm;
  cities: ApplicationCityOption[];
  defaultTopic?: string;
  defaults?: Record<string, string | undefined>;
};

export function HiddenUtmFields({ utm }: { utm: PublicApplicationUtm }) {
  return (
    <>
      <input name="utmSource" type="hidden" value={utm.source ?? ''} />
      <input name="utmMedium" type="hidden" value={utm.medium ?? ''} />
      <input name="utmCampaign" type="hidden" value={utm.campaign ?? ''} />
    </>
  );
}

export function HoneypotField({ id }: { id: string }) {
  return (
    <div aria-hidden="true" className="hidden">
      <label htmlFor={id}>Сайт</label>
      <input id={id} name="website" tabIndex={-1} type="text" autoComplete="off" />
    </div>
  );
}

export function ContactChannelFieldset({
  emailId,
  phoneId,
  telegramId,
  className
}: {
  emailId: string;
  phoneId: string;
  telegramId: string;
  className?: string;
}) {
  const hintId = `${emailId}-contact-channel-hint`;

  return (
    <fieldset aria-describedby={hintId} aria-required="true" className={cn('form-choice-group grid gap-4 md:grid-cols-3', className)}>
      <legend className="field-label px-1">
        Способ связи <span aria-hidden="true" className="text-[var(--accent)]">*</span>
      </legend>
      <p className="field-hint md:col-span-3" id={hintId}>
        Обязательное поле: укажите email, телефон или Telegram.
      </p>
      <FormField htmlFor={emailId} label="Email">
        <Input autoComplete="email" id={emailId} name="email" spellCheck={false} type="email" maxLength={180} />
      </FormField>
      <FormField htmlFor={phoneId} label="Телефон">
        <Input autoComplete="tel" id={phoneId} name="phone" inputMode="tel" maxLength={80} />
      </FormField>
      <FormField htmlFor={telegramId} label="Telegram">
        <Input autoComplete="off" id={telegramId} name="telegram" spellCheck={false} maxLength={80} />
      </FormField>
    </fieldset>
  );
}

export function PublicFormShellHeader({
  eyebrow,
  title,
  description,
  tone = 'light'
}: {
  eyebrow: string;
  title: string;
  description: string;
  tone?: 'light' | 'dark';
}) {
  const isDark = tone === 'dark';

  return (
    <div
        className={cn(
          'relative border-b px-5 py-5 md:px-6 md:py-6',
          isDark
            ? 'border-white/10 bg-[var(--graphite)] text-white'
            : 'border-[var(--divider-product)] bg-[var(--surface-wash)]'
        )}
      >
      <div
        aria-hidden="true"
        className={cn(
          'pointer-events-none absolute inset-x-0 top-0 h-px',
          isDark ? 'bg-white/18' : 'bg-[var(--surface-wash-strong)]'
        )}
      />
      <PublicEyebrow tone={isDark ? 'inverse' : 'accent'}>{eyebrow}</PublicEyebrow>
      <PublicDisplayTitle
        as="h3"
        className={cn('mt-3', isDark ? 'text-white' : 'text-[var(--text)]')}
        size="card"
      >
        {title}
      </PublicDisplayTitle>
      <PublicBodyText className="mt-3 max-w-xl" tone={isDark ? 'inverse' : 'muted'}>
        {description}
      </PublicBodyText>
    </div>
  );
}

export function PublicFormShellFooter({
  note,
  children,
  className
}: {
  note?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'mt-6 flex flex-col gap-3 border-t border-[var(--line)] pt-5 sm:flex-row sm:items-center sm:justify-between',
        className
      )}
    >
      {note ? <p className="max-w-md text-xs leading-6 text-[var(--muted)]">{note}</p> : null}
      {children}
    </div>
  );
}

export function PublicApplicationSection({
  eyebrow,
  title,
  description,
  enabled,
  result,
  children,
  disabledDescription,
  disabledLink,
  disclosureAliases,
  disclosureClosedContent,
  disclosureDefaultOpen,
  disclosureDescription,
  disclosureFocusSelector,
  disclosureId,
  disclosureOpenLabel,
  disclosureShowDefaultTrigger,
  disclosureTitle,
  introVariant = 'side',
  sectionId = 'applications'
}: PublicApplicationSectionProps) {
  const content = disclosureId ? (
    <RequestDisclosure
      aliases={disclosureAliases}
      closedContent={disclosureClosedContent}
      defaultOpen={Boolean(disclosureDefaultOpen || result)}
      description={disclosureDescription}
      focusSelector={disclosureFocusSelector}
      id={disclosureId}
      openLabel={disclosureOpenLabel}
      showDefaultTrigger={disclosureShowDefaultTrigger}
      title={disclosureTitle}
    >
      {children}
    </RequestDisclosure>
  ) : (
    children
  );

  if (introVariant === 'compact') {
    return (
      <section className="relative overflow-visible border-b border-[var(--line)] bg-[var(--surface)] py-12 md:py-14" id={sectionId}>
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_24%,var(--accent-soft),transparent_18%),radial-gradient(circle_at_72%_82%,rgba(20,20,18,0.05),transparent_22%)]"
        />
        <div className="container relative">
          <div className="mb-5 max-w-3xl">
            <PublicEyebrow>{eyebrow}</PublicEyebrow>
            <PublicDisplayTitle className="mt-3 max-w-4xl !text-[clamp(2rem,3vw,3.1rem)] [overflow-wrap:normal] [word-break:normal]">
              {title}
            </PublicDisplayTitle>
            <PublicBodyText className="mt-3 max-w-2xl">{description}</PublicBodyText>
            {result ? (
              <InlineAlert className="mt-5" tone={result.type === 'error' ? 'error' : 'success'}>
                {result.message}
              </InlineAlert>
            ) : null}
          </div>

          {!enabled ? (
            <EditorialShell className="p-5 md:p-6">
              <h3 className="text-lg font-semibold leading-7">Формы сейчас закрыты</h3>
              <p className="mt-3 text-sm leading-7 text-[var(--muted)]">
                {disabledDescription ?? 'Публичные формы временно закрыты. Напишите нам через страницу контактов.'}
              </p>
              <Button className="mt-6 rounded-[var(--radius-md)] sm:self-start" href={disabledLink?.href ?? '/contacts'} size="lg" variant="secondary">
                {disabledLink?.label ?? 'Открыть контакты'}
              </Button>
            </EditorialShell>
          ) : content}
        </div>
      </section>
    );
  }

  return (
    <section className="relative overflow-visible border-b border-[var(--line)] bg-[var(--surface)] py-14 md:py-18" id={sectionId}>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_24%,var(--accent-soft),transparent_18%),radial-gradient(circle_at_72%_82%,rgba(20,20,18,0.05),transparent_22%)]"
      />
      <div className="container relative grid gap-6 xl:grid-cols-[0.64fr_1.36fr] xl:items-start">
        <div className="xl:self-start">
          <EditorialShell className="p-6 md:p-8">
            <PublicEyebrow>{eyebrow}</PublicEyebrow>
            <PublicDisplayTitle className="mt-4 max-w-4xl !text-[clamp(2rem,3vw,3.25rem)] [overflow-wrap:normal] [word-break:normal]">
              {title}
            </PublicDisplayTitle>
            <PublicBodyText className="mt-5 max-w-md">{description}</PublicBodyText>
            {result ? (
              <InlineAlert className="mt-8" tone={result.type === 'error' ? 'error' : 'success'}>
                {result.message}
              </InlineAlert>
            ) : null}
          </EditorialShell>
        </div>

        {!enabled ? (
          <EditorialShell className="p-5 md:p-6">
            <h3 className="text-lg font-semibold leading-7">Формы сейчас закрыты</h3>
            <p className="mt-3 text-sm leading-7 text-[var(--muted)]">
              {disabledDescription ?? 'Публичные формы временно закрыты. Напишите нам через страницу контактов.'}
            </p>
            <Button className="mt-6 rounded-[var(--radius-md)] sm:self-start" href={disabledLink?.href ?? '/contacts'} size="lg" variant="secondary">
              {disabledLink?.label ?? 'Открыть контакты'}
            </Button>
          </EditorialShell>
        ) : content}
      </div>
    </section>
  );
}
