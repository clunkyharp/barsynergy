import { accentFont, bodyFont, displayFont } from '@/lib/fonts';
import { SectionIcon, type SectionIconType } from '@/components/public/section-icon';
import type { HomepageData } from '@/lib/public/home';

const stepVisuals: { icon: SectionIconType; tone: 'search' | 'contact' | 'growth' }[] = [
  { icon: 'search', tone: 'search' },
  { icon: 'contact', tone: 'contact' },
  { icon: 'chart', tone: 'growth' }
];

const stepLabels = ['01', '02', '03'];

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
            const stepIndex = stepLabels[index % stepLabels.length];

            return (
              <li
                className="home-step-card flex flex-col overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--surface-card)] shadow-[var(--shadow-card)]"
                data-step-tone={visual.tone}
                key={step.number}
              >
                <span className="home-step-card-visual flex items-center gap-4 border-b border-[var(--border-default)] p-5">
                  <span className="text-[var(--home-step-accent)]">
                    <SectionIcon size={28} type={visual.icon} />
                  </span>
                  <span className="font-mono text-[10px] font-medium uppercase tracking-[0.22em] text-[var(--muted)]">
                    {stepIndex}
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
