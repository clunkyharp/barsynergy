import { displayFont } from '@/lib/fonts';

type Step = {
  title: string;
  description: string;
};

type HowItWorksStepsProps = {
  steps: readonly Step[];
  columns?: 2 | 3 | 4;
};

export function HowItWorksSteps({ steps, columns = 4 }: HowItWorksStepsProps) {
  const gridClass = {
    2: 'sm:grid-cols-2',
    3: 'sm:grid-cols-3',
    4: 'sm:grid-cols-2 lg:grid-cols-4',
  }[columns];

  return (
    <div className={`grid gap-3 ${gridClass}`}>
      {steps.map((step, i) => (
        <div
          className="flex flex-col gap-3 rounded-[var(--radius-md)] border border-[var(--line)] bg-[var(--surface-card)] px-5 py-6"
          key={step.title}
        >
          <span aria-hidden="true" className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[var(--accent)]/30 bg-[var(--surface-wash)] text-[13px] font-semibold tracking-[var(--tracking-eyebrow-sm)] text-[var(--accent-ink)] tabular-nums">
            {i + 1}
          </span>
          <h3 className={`${displayFont.className} text-[1.05rem] font-semibold leading-tight text-[var(--text)]`}>{step.title}</h3>
          <p className="text-[13px] leading-5 text-[var(--muted)]">{step.description}</p>
        </div>
      ))}
    </div>
  );
}

type HowItWorksSectionProps = HowItWorksStepsProps & {
  title?: string;
};

export function HowItWorksSection({ steps, columns, title = 'Как это работает' }: HowItWorksSectionProps) {
  return (
    <section className="border-b border-[var(--line)] bg-[var(--background)] py-8 md:py-10">
      <div className="container">
        <h2 className="text-[10px] font-semibold uppercase tracking-[var(--tracking-eyebrow-md)] text-[var(--muted)]">
          {title}
        </h2>
        <div className="mt-4">
          <HowItWorksSteps columns={columns} steps={steps} />
        </div>
      </div>
    </section>
  );
}
