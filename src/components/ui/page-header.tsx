type PageHeaderProps = {
  eyebrow: string;
  title: string;
  description?: string;
};

export function PageHeader({ eyebrow, title, description }: PageHeaderProps) {
  return (
    <section className="border-b border-[var(--line)] py-16 md:py-24">
      <div className="container">
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[var(--accent)]">{eyebrow}</p>
        <h1 className="mt-4 max-w-4xl text-4xl font-semibold leading-tight md:text-6xl">
          {title}
        </h1>
        {description ? <p className="mt-6 max-w-2xl text-lg text-[var(--muted)]">{description}</p> : null}
      </div>
    </section>
  );
}
