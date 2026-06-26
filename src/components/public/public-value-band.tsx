import { displayFont } from '@/lib/fonts';

type ValueBandItem = {
  title: string;
  description: string;
};

type PublicValueBandProps = {
  eyebrow?: string;
  title: string;
  items: readonly ValueBandItem[];
};

/**
 * Dark-inversion value band: a high-contrast anchor section that breaks the
 * light flow. Uses editorial dark-inversion tokens and outlined ordinal numbers.
 * Render only on a non-empty listing — do not stack empty marketing blocks.
 */
export function PublicValueBand({ eyebrow, title, items }: PublicValueBandProps) {
  return (
    <section className="public-value-band border-b border-[var(--editorial-dark-border)] bg-[var(--editorial-dark-surface)] text-[var(--editorial-dark-text)]">
      <div className="container py-10 md:py-14">
        {eyebrow ? (
          <p className="text-[11px] font-bold uppercase tracking-[var(--tracking-eyebrow-md)] text-[var(--editorial-dark-label)]">
            {eyebrow}
          </p>
        ) : null}
        <h2 className={`${displayFont.className} mt-3 max-w-2xl text-[clamp(1.6rem,3.2vw,2.25rem)] font-semibold leading-tight text-[var(--editorial-dark-text)]`}>
          {title}
        </h2>
        <div className="mt-8 grid gap-6 sm:grid-cols-3 md:mt-10">
          {items.map((item, index) => (
            <div className="flex min-w-0 flex-col gap-3" key={item.title}>
              <span
                aria-hidden="true"
                className={`${displayFont.className} value-band-ordinal text-[1.6rem] font-semibold leading-none tabular-nums text-[var(--editorial-dark-label)]`}
              >
                {String(index + 1).padStart(2, '0')}
              </span>
              <h3 className="text-[1.05rem] font-semibold leading-tight text-[var(--editorial-dark-text)]">
                {item.title}
              </h3>
              <p className="text-[13px] leading-[1.6] text-[var(--editorial-dark-muted)]">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
