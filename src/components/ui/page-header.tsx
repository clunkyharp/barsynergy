type PageHeaderProps = {
  eyebrow?: string;
  title: string;
  description?: string;
};

export function PageHeader({ eyebrow, title, description }: PageHeaderProps) {
  return (
    <header>
      {eyebrow ? <p className="text-[11px] font-semibold uppercase tracking-[var(--tracking-eyebrow-md)] text-[var(--accent)]">{eyebrow}</p> : null}
      <h1 className={`max-w-5xl text-[1.75rem] font-semibold leading-[1.20] text-balance tracking-normal md:text-[2.25rem] ${eyebrow ? 'mt-3' : ''}`}>
        {title}
      </h1>
      {description ? <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--muted)] md:text-base md:leading-7">{description}</p> : null}
    </header>
  );
}
