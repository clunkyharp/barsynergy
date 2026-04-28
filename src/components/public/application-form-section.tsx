import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { displayFont } from '@/lib/fonts';
import type { ApplicationCityOption } from '@/lib/applications/form-options';
import type { PublicApplicationResult, PublicApplicationUtm } from '@/lib/applications/public-form-helpers';

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
    <label className="grid grid-cols-[1rem_minmax(0,1fr)] items-start gap-3.5 text-sm leading-6 text-[var(--muted)]">
      <Checkbox className="mt-[0.3em]" name="consent" required value="accepted" disabled={disabled} />
      <span className="min-w-0">{children}</span>
    </label>
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
    <section className="relative overflow-hidden border-b border-black/20 bg-[var(--surface)] py-10 md:py-14" id="applications">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_24%,rgba(153,44,38,0.08),transparent_18%),radial-gradient(circle_at_78%_22%,rgba(255,255,255,0.62),transparent_20%),radial-gradient(circle_at_72%_82%,rgba(20,20,18,0.05),transparent_22%)]"
      />
      <div className="container relative grid gap-8 xl:grid-cols-[0.58fr_1.42fr]">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--accent)]">{eyebrow}</p>
          <h2 className={`${displayFont.className} display-tight mt-3 text-[44px] md:text-[58px]`}>{title}</h2>
          <p className="mt-5 max-w-md text-sm leading-7 text-[var(--muted)]">{description}</p>
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
              {disabledDescription ?? 'До утверждения юридических текстов заявки принимаются только через контактный раздел.'}
            </p>
            <Button className="mt-5" href={disabledLink?.href ?? '/contacts'} variant="secondary">
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
