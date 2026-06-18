import { accentFont, bodyFont, displayFont } from '@/lib/fonts';
import { SectionIcon, type SectionIconType } from '@/components/public/section-icon';
import type { HomepageData } from '@/lib/public/home';

const stepVisuals: { icon: SectionIconType; tone: 'search' | 'contact' | 'growth' }[] = [
  { icon: 'search', tone: 'search' },
  { icon: 'contact', tone: 'contact' },
  { icon: 'chart', tone: 'growth' }
];

export function HomeSteps({ steps }: { steps: HomepageData['steps'] }) {
  if (steps.length === 0) {
    return null;
  }

  return (
    <section
      aria-labelledby="home-steps-title"
      className="background-zone background-zone-gray border-b border-[var(--line)] py-10 md:py-14"
      id="home-steps"
    >
      <div className="container">
        <div className="mb-8 max-w-[42rem]">
          <p className={`${accentFont.className} text-[10px] font-bold uppercase tracking-[var(--tracking-eyebrow-md)] text-[var(--accent)]`}>
            Как это работает
          </p>
          <h2
            className={`${displayFont.className} mt-2 text-[2rem] font-semibold leading-none text-[var(--text)] md:text-[2.6rem]`}
            id="home-steps-title"
          >
            Три шага до результата
          </h2>
        </div>
        <ol className="grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-5">
          {steps.map((step, index) => {
            const visual = stepVisuals[index % stepVisuals.length];

            return (
              <li
                className="home-step-card relative flex flex-col overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--surface-card)] shadow-[var(--shadow-card)]"
                data-step-tone={visual.tone}
                key={step.number}
              >
                <span className="home-step-card-visual relative flex items-center justify-between gap-4 overflow-hidden p-5">
                  <span className="relative z-10 grid size-12 place-items-center rounded-[var(--radius-md)] border border-[color-mix(in_oklab,var(--home-step-accent)_42%,var(--border-default))] bg-[color-mix(in_oklab,var(--home-step-accent)_16%,var(--surface-card))]">
                    <SectionIcon className="relative z-10" size={30} type={visual.icon} />
                  </span>
                  <span className={`${displayFont.className} relative z-10 text-[3rem] font-bold leading-none text-[var(--home-step-accent)]`}>
                    {step.number}
                  </span>
                  <span aria-hidden="true" className="home-step-card-watermark">
                    {step.number}
                  </span>
                </span>
                <span className="flex flex-1 flex-col p-5 pt-4">
                  <h3 className={`${displayFont.className} text-[1.25rem] font-semibold leading-tight text-[var(--text)]`}>
                    {step.title}
                  </h3>
                  <p className={`${bodyFont.className} mt-2 text-sm leading-6 text-[var(--muted)]`}>
                    {step.description}
                  </p>
                </span>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
