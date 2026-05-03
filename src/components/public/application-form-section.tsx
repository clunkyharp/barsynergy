import { PublicBodyText, PublicDisplayTitle, PublicEyebrow } from '@/components/public/public-primitives';
import { Button } from '@/components/ui/button';
import { EditorialShell } from '@/components/ui/editorial-shell';
import { InlineAlert } from '@/components/ui/inline-alert';
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
            : 'border-[var(--divider-product)] bg-[linear-gradient(135deg,rgba(255,255,255,0.86),rgba(255,255,255,0.58))]'
        )}
      >
      <div
        aria-hidden="true"
        className={cn(
          'pointer-events-none absolute inset-x-0 top-0 h-px',
          isDark ? 'bg-white/18' : 'bg-white/90'
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
        'mt-6 flex flex-col gap-3 border-t border-black/10 pt-5 sm:flex-row sm:items-center sm:justify-between',
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
  disabledLink
}: PublicApplicationSectionProps) {
  return (
    <section className="relative overflow-hidden border-b border-black/20 bg-[var(--surface)] py-14 md:py-18" id="applications">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_24%,rgba(153,44,38,0.08),transparent_18%),radial-gradient(circle_at_78%_22%,rgba(255,255,255,0.62),transparent_20%),radial-gradient(circle_at_72%_82%,rgba(20,20,18,0.05),transparent_22%)]"
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
            <h3 className="text-lg font-semibold uppercase leading-7">Формы сейчас закрыты</h3>
            <p className="mt-3 text-sm leading-7 text-[var(--muted)]">
              {disabledDescription ?? 'Сейчас форму использовать нельзя. Напишите нам через страницу контактов.'}
            </p>
            <Button className="mt-6 rounded-full sm:self-start" href={disabledLink?.href ?? '/contacts'} size="lg" variant="secondary">
              {disabledLink?.label ?? 'Открыть контакты'}
            </Button>
          </EditorialShell>
        ) : (
          children
        )}
      </div>
    </section>
  );
}
