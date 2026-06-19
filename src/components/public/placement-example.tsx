import { ArrowLeft } from 'lucide-react';
import type { ReactNode } from 'react';
import { PublicEyebrow } from '@/components/public/public-primitives';
import { displayFont } from '@/lib/fonts';

type PlacementAnnotation = {
  title: string;
  description: string;
};

type PlacementExampleProps = {
  eyebrow: string;
  title: string;
  description?: string;
  visual: ReactNode;
  annotations: readonly PlacementAnnotation[];
  tone?: 'ivory' | 'beige';
};

/**
 * Annotated "this is how it looks" block: a representative interface fragment
 * (`visual`) paired with callouts that point at its parts. Used on commercial
 * pages to show placement instead of only describing it in prose.
 */
export function PlacementExample({
  eyebrow,
  title,
  description,
  visual,
  annotations,
  tone = 'ivory'
}: PlacementExampleProps) {
  return (
    <section className={`background-zone background-zone-${tone} border-b border-[var(--line)] py-12 md:py-20`}>
      <div className="container">
        <div className="max-w-2xl">
          <PublicEyebrow>{eyebrow}</PublicEyebrow>
          <h2 className={`${displayFont.className} mt-4 text-[clamp(2rem,3.6vw,3.2rem)] font-semibold leading-[1.02] text-[var(--text)]`}>
            {title}
          </h2>
          {description ? (
            <p className="mt-4 text-base leading-7 text-[var(--muted)]">{description}</p>
          ) : null}
        </div>

        <div className="mt-10 grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.78fr)] lg:items-center lg:gap-12">
          <figure className="rounded-[var(--radius-xl)] border border-[var(--border-default)] bg-[var(--surface-elevated)] p-4 shadow-[var(--shadow-panel)] md:p-6">
            {visual}
          </figure>
          <ul className="grid gap-4">
            {annotations.map((annotation) => (
              <li className="grid grid-cols-[1.5rem_minmax(0,1fr)] gap-3" key={annotation.title}>
                <ArrowLeft aria-hidden="true" className="mt-0.5 shrink-0 text-[var(--accent)] max-lg:rotate-90" size={18} strokeWidth={2} />
                <div className="min-w-0">
                  <p className="text-[15px] font-semibold leading-6 text-[var(--text)]">{annotation.title}</p>
                  <p className="mt-0.5 text-sm leading-6 text-[var(--muted)]">{annotation.description}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
