import { ArrowUpRight } from 'lucide-react';
import { PublicBodyText, PublicDisplayTitle, PublicEyebrow } from '@/components/public/public-primitives';
import { Button } from '@/components/ui/button';

export type ToolTeaserContent = {
  eyebrow: string;
  title: string;
  cardEyebrow: string;
  cardTitle: string;
  description: string;
  steps: string[];
  actionLabel: string;
  actionHref: string;
};

function cleanCalculatorTeaserText(value: string) {
  return value
    .replace(/\s*без регистрации и сохранения данных/giu, '')
    .replace(/\s*без регистрации/giu, '')
    .replace(/\s*и сохранения данных/giu, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export function ToolTeaser({ teaser }: { teaser: ToolTeaserContent }) {
  const description = cleanCalculatorTeaserText(teaser.description);
  const steps = teaser.steps.filter(Boolean).slice(0, 3);

  return (
    <section className="background-zone background-zone-tool editorial-grid scroll-mt-28 border-b border-[var(--line)] py-8 md:py-10" id="home-calculator">
      <div className="container">
        <article className="home-tool-teaser mx-auto max-w-6xl overflow-hidden rounded-[var(--radius-xl)] border border-[var(--border-default)] bg-[var(--surface-wash)] shadow-[var(--shadow-panel)]">
          <div className="home-tool-teaser-grid grid gap-5 p-5 md:p-6 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,0.48fr)]">
            <div className="min-w-0">
              <PublicEyebrow>{teaser.eyebrow}</PublicEyebrow>
              <PublicDisplayTitle className="max-w-2xl !text-[clamp(2rem,4vw,3.45rem)] [overflow-wrap:normal] [word-break:normal]">
                {teaser.title}
              </PublicDisplayTitle>
              <PublicBodyText className="mt-3 max-w-xl" size="md">
                {description}
              </PublicBodyText>
            </div>
            <div className="home-tool-teaser-rail min-w-0">
              <p className="text-xs font-semibold uppercase tracking-[var(--tracking-eyebrow-md)] text-[var(--editorial-dark-muted)]">{teaser.cardEyebrow}</p>
              <p className="mt-3 max-w-sm text-base leading-7 text-[var(--editorial-dark-text)]">{teaser.cardTitle}</p>
              <Button className="mt-5 w-full rounded-[var(--radius-md)] px-6" href={teaser.actionHref}>
                {teaser.actionLabel}
                <ArrowUpRight size={16} />
              </Button>
            </div>
            {steps.length > 0 ? (
              <ol className="home-tool-step-list grid gap-3 border-t border-[var(--line)] pt-5 lg:col-span-2 lg:grid-cols-3">
                {steps.map((step, index) => (
                  <li className="home-tool-step grid min-w-0 grid-cols-[2.25rem_minmax(0,1fr)] gap-3" key={step}>
                    <span className="home-tool-step-index">{index + 1}</span>
                    <span className="pt-0.5 text-sm leading-6 text-[var(--editorial-dark-text)]">{step}</span>
                  </li>
                ))}
              </ol>
            ) : null}
          </div>
        </article>
      </div>
    </section>
  );
}
