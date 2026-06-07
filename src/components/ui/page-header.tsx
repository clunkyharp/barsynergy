type PageHeaderProps = {
  eyebrow: string;
  title: string;
  description?: string;
  compact?: boolean;
};

export function PageHeader({ eyebrow, title, description, compact = false }: PageHeaderProps) {
  return (
    <section className={compact ? 'border-b border-[var(--line)] py-5 md:py-7' : 'border-b border-[var(--line)] py-10 md:py-14'}>
      <div className="container">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--accent)]">{eyebrow}</p>
        <h1 className={compact ? 'mt-3 max-w-5xl text-[1.75rem] font-semibold leading-tight tracking-normal md:text-[2.5rem]' : 'mt-4 max-w-5xl text-[2.125rem] font-semibold leading-tight tracking-normal md:text-[3rem]'}>
          {title}
        </h1>
        {description ? <p className={compact ? 'mt-3 max-w-2xl text-sm leading-6 text-[var(--muted)] md:text-base md:leading-7' : 'mt-6 max-w-2xl text-base leading-7 text-[var(--muted)] md:text-lg md:leading-8'}>{description}</p> : null}
      </div>
    </section>
  );
}
