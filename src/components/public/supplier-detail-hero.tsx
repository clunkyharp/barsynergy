import { PublicBreadcrumbs } from '@/components/public/public-primitives';
import { displayFont } from '@/lib/fonts';

type SupplierDetailHeroProps = {
  title: string;
  summary: string;
  companyName?: string;
  label?: string;
  cityName?: string;
  serviceArea?: string;
  isVerified: boolean;
  externalUrl?: string;
  externalUrlLabel?: string;
};

function supplierInitials(value: string) {
  return value
    .split(/\s+/)
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

export function SupplierDetailHero({
  title,
  summary,
  companyName,
  label,
  cityName,
  serviceArea,
  isVerified,
  externalUrl,
  externalUrlLabel,
}: SupplierDetailHeroProps) {
  return (
    <section className="supplier-detail-hero background-zone background-zone-graphite relative overflow-hidden border-b border-[var(--line)]">
      <div className="container">
        <div className="supplier-detail-hero-content">
          <div className="supplier-detail-logo" aria-hidden="true">
            <span>{supplierInitials(companyName ?? title)}</span>
          </div>

          <div className="min-w-0">
            <PublicBreadcrumbs
              current={title}
              items={[
                { href: '/', label: 'Главная' },
                { href: '/suppliers', label: 'Поставщики' }
              ]}
            />

            <h1
              className={`${displayFont.className} supplier-detail-title mt-4 max-w-[22ch] text-pretty font-semibold text-balance tracking-normal text-[var(--text)] [overflow-wrap:normal] [text-wrap:pretty] [word-break:normal] max-[480px]:max-w-full`}
            >
              {title}
            </h1>

            {companyName && companyName !== title ? (
              <p className="mt-1 text-base leading-6 text-[var(--muted)]">{companyName}</p>
            ) : null}

            {label || cityName || serviceArea ? (
              <div className="supplier-detail-chips mt-4 flex flex-wrap items-center gap-2">
                {label ? <span className="supplier-detail-chip supplier-detail-chip-accent">{label}</span> : null}
                {cityName ? <span className="supplier-detail-chip">{cityName}</span> : null}
                {serviceArea ? <span className="supplier-detail-chip">География: {serviceArea}</span> : null}
                {isVerified ? <span className="supplier-detail-chip">Проверенный поставщик</span> : null}
              </div>
            ) : null}

            {summary ? (
              <p className="mt-4 max-w-2xl text-[15px] leading-7 text-[var(--muted)] md:text-base">
                {summary}
              </p>
            ) : null}

            {externalUrl ? (
              <div className="mt-6 flex flex-wrap items-center gap-3">
                <a
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-[var(--radius-sm)] border border-[var(--border-default)] bg-transparent px-5 text-sm font-semibold text-[var(--text)] transition-colors hover:bg-[var(--surface-wash)]"
                  href={externalUrl}
                  rel="noreferrer noopener"
                  target="_blank"
                >
                  {externalUrlLabel ?? 'Сайт компании'}
                </a>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
