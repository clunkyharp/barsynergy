type SectionHeaderProps = {
  eyebrow: string;
  title: string;
  description?: string;
};

export function SectionHeader({ eyebrow, title, description }: SectionHeaderProps) {
  return (
    <div className="max-w-3xl">
      <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[var(--accent)]">{eyebrow}</p>
      <h2 className="mt-3 text-3xl font-semibold tracking-[-0.01em] md:text-4xl">{title}</h2>
      {description ? <p className="mt-4 text-lg text-[var(--muted)]">{description}</p> : null}
    </div>
  );
}
