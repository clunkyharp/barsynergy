import { PublicBodyText, PublicDisplayTitle, PublicEyebrow } from '@/components/public/public-primitives';
import { PublicFormValidation } from '@/components/public/public-form-validation';
import { RequestDisclosure } from '@/components/public/request-disclosure';
import { Button } from '@/components/ui/button';
import { EditorialShell } from '@/components/ui/editorial-shell';
import { FormField } from '@/components/ui/form-field';
import { InlineAlert } from '@/components/ui/inline-alert';
import { Input } from '@/components/ui/input';
import type { ApplicationCityOption } from '@/lib/applications/form-options';
import type { PublicApplicationResult, PublicApplicationUtm } from '@/lib/applications/public-form-helpers';
import { SUPPORT_EMAIL } from '@/lib/contact-info';
import { cn } from '@/lib/utils';

const PUBLIC_CONTACT_MAILTO = `mailto:${SUPPORT_EMAIL}`;

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
  disclosureClosedPanelClassName?: string;
  disclosureDefaultOpen?: boolean;
  disclosureDescription?: string;
  disclosureFocusSelector?: string;
  disclosureHeadingLevel?: 'h2' | 'h3';
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
  className,
  defaults
}: {
  emailId: string;
  phoneId: string;
  telegramId: string;
  className?: string;
  defaults?: {
    email?: string;
    phone?: string;
    telegram?: string;
  };
}) {
  const hintId = `${emailId}-contact-channel-hint`;

  return (
    <fieldset aria-describedby={hintId} className={cn('contact-channel-fieldset grid gap-4 md:grid-cols-3', className)}>
      <legend className="field-label">
        Способ связи <span aria-hidden="true" className="text-[var(--accent)]">*</span>
      </legend>
      <p className="field-hint md:col-span-3" id={hintId}>
        Укажите email, телефон или Telegram.
      </p>
      <FormField htmlFor={emailId} label="Email">
        <Input autoComplete="email" defaultValue={defaults?.email ?? ''} id={emailId} name="email" placeholder="name@example.com" spellCheck={false} type="email" maxLength={180} />
      </FormField>
      <FormField htmlFor={phoneId} label="Телефон">
        <Input autoComplete="tel" defaultValue={defaults?.phone ?? ''} id={phoneId} name="phone" inputMode="tel" placeholder="+7 999 123 45 67" maxLength={80} />
      </FormField>
      <FormField htmlFor={telegramId} label="Telegram">
        <Input autoComplete="off" defaultValue={defaults?.telegram ?? ''} id={telegramId} name="telegram" placeholder="@username" spellCheck={false} maxLength={80} />
      </FormField>
    </fieldset>
  );
}

export function PublicSubmissionFeedback({
  className,
  result,
  title
}: {
  className?: string;
  result: PublicApplicationResult;
  title?: string;
}) {
  const feedbackTitle = title ?? (result.type === 'error' ? 'Не удалось отправить' : 'Заявка отправлена');

  return (
    <InlineAlert className={cn('public-submission-feedback', className)} tone={result.type === 'error' ? 'error' : 'success'}>
      <strong className="public-submission-feedback-title">{feedbackTitle}</strong>
      <span className="public-submission-feedback-body">{result.message}</span>
      {result.type === 'success' && result.applicationId ? (
        <p className="mt-2 text-xs leading-5 opacity-85">
          Номер заявки: <span className="font-mono">{result.applicationId}</span>
          <span className="block mt-1">
            <a className="font-semibold underline underline-offset-2 hover:no-underline" href="/auth/register/user">
              Зарегистрируйтесь
            </a>,
            чтобы отслеживать статус заявки в личном кабинете.
          </span>
        </p>
      ) : null}
    </InlineAlert>
  );
}

export function PublicFormShellHeader({
  eyebrow,
  title,
  description,
  headingLevel = 'h3',
  tone = 'light'
}: {
  eyebrow: string;
  title: string;
  description: string;
  headingLevel?: 'h2' | 'h3';
  tone?: 'light' | 'dark';
}) {
  const isDark = tone === 'dark';
  const Heading = headingLevel;

  return (
    <div
        className={cn(
          'public-form-shell-header relative border-b px-5 py-5 md:px-6 md:py-6',
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
      <PublicFormValidation />
      <PublicEyebrow tone={isDark ? 'inverse' : 'accent'}>{eyebrow}</PublicEyebrow>
      <PublicDisplayTitle as={Heading} className={cn('mt-3', isDark ? 'text-white' : 'text-[var(--text)]')} size="card">
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
        'public-form-shell-footer mt-6 flex flex-col gap-3 border-t border-[var(--line)] pt-5 sm:flex-row sm:items-center sm:justify-between',
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
  disclosureClosedPanelClassName,
  disclosureDefaultOpen,
  disclosureDescription,
  disclosureFocusSelector,
  disclosureHeadingLevel,
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
      closedPanelClassName={disclosureClosedPanelClassName}
      closedContent={disclosureClosedContent}
      defaultOpen={Boolean(disclosureDefaultOpen || result)}
      description={disclosureDescription}
      focusSelector={disclosureFocusSelector}
      headingLevel={disclosureHeadingLevel}
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
            {result ? <PublicSubmissionFeedback className="mt-5" result={result} /> : null}
          </div>

          {!enabled ? (
            <EditorialShell className="p-5 md:p-6">
              <h3 className="text-lg font-semibold leading-7">Формы сейчас закрыты</h3>
              <p className="mt-3 text-sm leading-7 text-[var(--muted)]">
                {disabledDescription ?? `Формы временно закрыты. Напишите нам на ${SUPPORT_EMAIL}.`}
              </p>
              <Button className="mt-6 rounded-[var(--radius-md)] sm:self-start" href={disabledLink?.href ?? PUBLIC_CONTACT_MAILTO} size="lg" variant="secondary">
                {disabledLink?.label ?? 'Написать на почту'}
              </Button>
            </EditorialShell>
          ) : content}
        </div>
      </section>
    );
  }

  return (
    <section className="relative overflow-visible border-b border-[var(--line)] bg-[var(--surface)] py-8 md:py-10" id={sectionId}>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_24%,var(--accent-soft),transparent_18%),radial-gradient(circle_at_72%_82%,rgba(20,20,18,0.05),transparent_22%)]"
      />
      <div className="container relative grid gap-5 xl:grid-cols-[minmax(15rem,0.48fr)_minmax(0,1.52fr)] xl:items-start">
        <div className="xl:self-start">
          <EditorialShell className="p-5 md:p-6">
            <PublicEyebrow>{eyebrow}</PublicEyebrow>
            <PublicDisplayTitle className="mt-3 max-w-4xl !text-[clamp(1.85rem,2.5vw,2.65rem)] [overflow-wrap:normal] [word-break:normal]">
              {title}
            </PublicDisplayTitle>
            <PublicBodyText className="mt-3 max-w-md text-sm leading-6">{description}</PublicBodyText>
            {result ? <PublicSubmissionFeedback className="mt-5" result={result} /> : null}
          </EditorialShell>
        </div>

        {!enabled ? (
          <EditorialShell className="p-5 md:p-6">
            <h3 className="text-lg font-semibold leading-7">Формы сейчас закрыты</h3>
            <p className="mt-3 text-sm leading-7 text-[var(--muted)]">
              {disabledDescription ?? `Формы временно закрыты. Напишите нам на ${SUPPORT_EMAIL}.`}
            </p>
            <Button className="mt-6 rounded-[var(--radius-md)] sm:self-start" href={disabledLink?.href ?? PUBLIC_CONTACT_MAILTO} size="lg" variant="secondary">
              {disabledLink?.label ?? 'Написать на почту'}
            </Button>
          </EditorialShell>
        ) : content}
      </div>
    </section>
  );
}
