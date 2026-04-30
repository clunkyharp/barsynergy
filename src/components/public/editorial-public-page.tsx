import { ArrowUpRight } from 'lucide-react';
import { PublicActionRow, PublicBodyText, PublicDisplayTitle, PublicEyebrow } from '@/components/public/public-primitives';
import { Button } from '@/components/ui/button';

type Metric = {
  value: string;
  label: string;
};

type Row = {
  label: string;
  title: string;
  description: string;
};

type LinkItem = {
  label: string;
  href: string;
};

type EditorialPublicPageProps = {
  eyebrow: string;
  title: string;
  description: string;
  summary: string;
  summaryHeading?: string;
  metrics: Metric[];
  rows: Row[];
  rowsHeading?: string;
  primaryLink: LinkItem;
  secondaryLink?: LinkItem;
};

export function EditorialPublicPage({
  eyebrow,
  title,
  description,
  summary,
  primaryLink,
  secondaryLink
}: EditorialPublicPageProps) {
  return (
    <div>
      <section className="relative overflow-hidden border-b border-black/12 py-10 md:py-14">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_18%,rgba(153,44,38,0.08),transparent_18%),radial-gradient(circle_at_82%_26%,rgba(255,255,255,0.54),transparent_18%),radial-gradient(circle_at_74%_80%,rgba(20,20,18,0.05),transparent_24%)]"
        />
        <div className="container relative grid gap-8 xl:grid-cols-[1fr_0.58fr] xl:items-start">
          <div className="min-w-0 xl:pt-4">
            <PublicEyebrow tone="muted">{eyebrow}</PublicEyebrow>
            <PublicDisplayTitle as="h1" className="mt-3 max-w-5xl break-words text-[32px] sm:text-[44px] md:text-[64px] xl:text-[78px]" size="section">
              {title}
            </PublicDisplayTitle>
          </div>
          <div className="min-w-0 border-l border-black/20 pl-5 xl:pt-4">
            <PublicBodyText className="max-w-[36rem]" size="md">
              {description}
            </PublicBodyText>
            <PublicBodyText className="mt-5 max-w-[36rem] text-[var(--muted)]" size="sm">
              {summary}
            </PublicBodyText>
            <PublicActionRow>
              <Button
                className="min-h-12 w-full max-w-full border-[var(--graphite)] bg-[var(--graphite)] px-5 leading-5 tracking-[0.06em] hover:bg-black sm:w-auto"
                href={primaryLink.href}
              >
                {primaryLink.label}
                <ArrowUpRight size={18} />
              </Button>
              {secondaryLink ? (
                <Button
                  className="min-h-12 w-full max-w-full border-black/25 px-5 leading-5 tracking-[0.06em] sm:w-auto"
                  href={secondaryLink.href}
                  variant="secondary"
                >
                  {secondaryLink.label}
                </Button>
              ) : null}
            </PublicActionRow>
          </div>
        </div>
      </section>
    </div>
  );
}
