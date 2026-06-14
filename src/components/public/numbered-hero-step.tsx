import { displayFont } from '@/lib/fonts';

type NumberedHeroStepProps = {
  number: number;
  title: string;
  description: string;
};

export function NumberedHeroStep({ number, title, description }: NumberedHeroStepProps) {
  return (
    <div className="flex gap-3">
      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--accent)] text-[11px] font-bold text-[var(--accent-contrast)]">
        {number}
      </span>
      <div>
        <p className={`${displayFont.className} text-sm font-semibold text-[var(--text)]`}>
          {title}
        </p>
        <p className="mt-0.5 text-sm leading-6 text-[var(--muted)]">
          {description}
        </p>
      </div>
    </div>
  );
}
