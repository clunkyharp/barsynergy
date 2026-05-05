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
  summaryHeading = 'Коротко',
  primaryLink,
  secondaryLink
}: EditorialPublicPageProps) {
  return (
    <div>
      <section className="background-zone background-zone-hero border-b border-[var(--line)] py-10 md:py-14">
        <div className="container relative grid gap-8 xl:grid-cols-[1fr_0.58fr] xl:items-start">
          <div className="min-w-0 xl:pt-4">
            <PublicEyebrow tone="muted">{eyebrow}</PublicEyebrow>
            <PublicDisplayTitle as="h1" className="mt-3 max-w-5xl break-words text-[32px] sm:text-[44px] md:text-[64px] xl:text-[78px]" size="section">
              {title}
            </PublicDisplayTitle>
          </div>
          <div className="min-w-0 border-t border-[var(--line)] pt-5 xl:border-l xl:border-t-0 xl:pl-5 xl:pt-4">
            <PublicEyebrow tone="muted">{summaryHeading}</PublicEyebrow>
            <PublicBodyText className="mt-3 max-w-[36rem] text-[var(--text)]" size="md" tone="default">
              {description}
            </PublicBodyText>
            <PublicBodyText className="mt-5 max-w-[36rem]" size="sm">
              {summary}
            </PublicBodyText>
            <PublicActionRow>
              <Button
                className="min-h-12 w-full max-w-full rounded-[var(--radius-md)] px-5 leading-5 tracking-normal sm:w-auto"
                href={primaryLink.href}
              >
                {primaryLink.label}
                <ArrowUpRight size={18} />
              </Button>
              {secondaryLink ? (
                <Button
                  className="min-h-12 w-full max-w-full rounded-[var(--radius-md)] px-5 leading-5 tracking-normal sm:w-auto"
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
