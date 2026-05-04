import { displayFont } from '@/lib/fonts';

type PageHeaderProps = {
  eyebrow: string;
  title: string;
  description?: string;
};

export function PageHeader({ eyebrow, title, description }: PageHeaderProps) {
  return (
    <section className="border-b border-[var(--line)] py-10 md:py-14">
      <div className="container">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--accent)]">{eyebrow}</p>
        <h1 className={`${displayFont.className} mt-4 max-w-5xl text-[42px] font-semibold leading-[0.96] tracking-normal md:text-[68px]`}>
          {title}
        </h1>
        {description ? <p className="mt-6 max-w-2xl text-base leading-7 text-[var(--muted)] md:text-lg md:leading-8">{description}</p> : null}
      </div>
    </section>
  );
}
