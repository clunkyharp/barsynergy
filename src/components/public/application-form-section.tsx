import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { displayFont } from '@/lib/fonts';
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

export function ConsentCheckboxField({ children, disabled }: { children: React.ReactNode; disabled?: boolean }) {
  return (
    <label
      className={cn(
        'grid grid-cols-[1.25rem_minmax(0,1fr)] items-start gap-3.5 rounded-[1.15rem] border border-black/10 bg-[rgba(255,255,255,0.6)] px-4 py-4 text-sm leading-6 text-[var(--muted)]',
        disabled && 'opacity-70'
      )}
    >
      <Checkbox name="consent" required value="accepted" disabled={disabled} />
      <span className="min-w-0">{children}</span>
    </label>
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
          : 'border-black/10 bg-[linear-gradient(135deg,rgba(255,255,255,0.86),rgba(255,255,255,0.58))]'
      )}
    >
      <div
        aria-hidden="true"
        className={cn(
          'pointer-events-none absolute inset-x-0 top-0 h-px',
          isDark ? 'bg-white/18' : 'bg-white/90'
        )}
      />
      <p
        className={cn(
          'text-[11px] font-semibold uppercase tracking-[0.16em]',
          isDark ? 'text-white/54' : 'text-[var(--accent)]'
        )}
      >
        {eyebrow}
      </p>
      <h3
        className={cn(
          'mt-3 text-xl font-semibold uppercase leading-7 md:text-2xl md:leading-8',
          isDark ? 'text-white' : 'text-[var(--text)]'
        )}
      >
        {title}
      </h3>
      <p className={cn('mt-3 max-w-xl text-sm leading-7', isDark ? 'text-white/72' : 'text-[var(--muted)]')}>
        {description}
      </p>
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
  const sectionNotes = [
    'Достаточно одного рабочего контакта: email, телефон или Telegram.',
    'Поля с описанием лучше заполнять конкретно: задача, формат, сроки.'
  ];

  return (
    <section className="relative overflow-hidden border-b border-black/20 bg-[var(--surface)] py-14 md:py-18" id="applications">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_24%,rgba(153,44,38,0.08),transparent_18%),radial-gradient(circle_at_78%_22%,rgba(255,255,255,0.62),transparent_20%),radial-gradient(circle_at_72%_82%,rgba(20,20,18,0.05),transparent_22%)]"
      />
      <div className="container relative grid gap-6 xl:grid-cols-[0.64fr_1.36fr] xl:items-start">
        <div className="xl:sticky xl:top-24">
          <div className="editorial-form-shell p-6 md:p-8">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--accent)]">{eyebrow}</p>
            <h2 className={`${displayFont.className} display-tight mt-4 max-w-4xl text-[44px] md:text-[58px]`}>{title}</h2>
            <p className="mt-5 max-w-md text-sm leading-7 text-[var(--muted)]">{description}</p>
            <div className="mt-8 border-t border-black/10 pt-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">Перед отправкой</p>
              <ul className="mt-4 grid gap-3 text-sm leading-6 text-[var(--muted)]">
                {sectionNotes.map((item) => (
                  <li className="grid grid-cols-[0.5rem_minmax(0,1fr)] items-start gap-3" key={item}>
                    <span className="mt-2 h-2 w-2 rounded-full bg-[var(--accent)]" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            {result ? (
              <div
                className={
                  result.type === 'error'
                    ? 'mt-8 rounded-[1.15rem] border border-[var(--danger)] bg-[var(--danger)]/5 px-4 py-4 text-sm leading-6 text-[var(--danger)]'
                    : 'mt-8 rounded-[1.15rem] border border-[var(--success)] bg-[var(--success)]/5 px-4 py-4 text-sm leading-6 text-[var(--success)]'
                }
              >
                {result.message}
              </div>
            ) : null}
          </div>
        </div>

        {!enabled ? (
          <div className="editorial-form-shell p-5 md:p-6">
            <h3 className="text-lg font-semibold uppercase leading-7">Заявки временно закрыты</h3>
            <p className="mt-3 text-sm leading-7 text-[var(--muted)]">
              {disabledDescription ?? 'Форма сейчас недоступна. Для связи используйте раздел контактов.'}
            </p>
            <Button className="mt-6 min-h-12 rounded-full px-6 tracking-[0.12em] sm:self-start" href={disabledLink?.href ?? '/contacts'} variant="secondary">
              {disabledLink?.label ?? 'Перейти в контакты'}
            </Button>
          </div>
        ) : (
          children
        )}
      </div>
    </section>
  );
}
