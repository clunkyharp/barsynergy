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
    <label className="flex items-start gap-3 text-sm leading-6 text-[var(--muted)]">
      <Checkbox name="consent" required value="accepted" disabled={disabled} />
      <span>{children}</span>
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
    <section className="border-b border-black/20 bg-[var(--surface)] py-10 md:py-14" id="applications">
      <div className="container grid gap-8 xl:grid-cols-[0.58fr_1.42fr]">
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
