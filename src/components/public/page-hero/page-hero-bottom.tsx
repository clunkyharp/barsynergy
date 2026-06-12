import { Check } from 'lucide-react';
import { AppLink } from '@/components/ui/app-link';
import { MetaChip } from '@/components/ui/meta-chip';
import { displayFont } from '@/lib/fonts';
import { cn } from '@/lib/utils';
import type { BottomSection, PageHeroTone } from './page-hero-types';

export function BottomSection({
  bottom,
  tone
}: {
  bottom: BottomSection;
  tone: PageHeroTone;
}) {
  const isDark = tone === 'dark';
  const borderClass = isDark ? 'border-[var(--editorial-dark-border)]' : 'border-[var(--line)]';
  const bgClass = isDark ? 'bg-[rgba(25,29,35,0.88)]' : 'bg-[var(--surface-muted)]';

  return (
    <div className={cn('border-t', borderClass, bgClass)}>
      <div className="container py-5 md:py-6">
        {bottom.kind === 'chips' ? (
          <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 md:flex-wrap md:overflow-visible">
            {bottom.items.map((chip) => (
              <AppLink href={chip.href} key={`${chip.label}-${chip.href}`}>
                <MetaChip
                  className="shrink-0 cursor-pointer transition-[border-color,color] duration-[var(--motion-duration-fast)] hover:border-[var(--accent)] hover:text-[var(--accent)]"
                  variant={isDark ? 'inverse' : 'default'}
                >
                  {chip.label}
                </MetaChip>
              </AppLink>
            ))}
          </div>
        ) : null}

        {bottom.kind === 'stats' ? (
          <dl className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {bottom.items.map((stat) => (
              <div
                className={cn(
                  'rounded-[var(--radius-md)] border px-3.5 py-3',
                  isDark
                    ? 'border-[var(--editorial-dark-border)] text-[var(--editorial-dark-text)]'
                    : 'border-[var(--border-default)]'
                )}
                key={`${stat.value}-${stat.label}`}
              >
                <dd
                  className={`${displayFont.className} text-[1.4rem] font-semibold leading-none tabular-nums ${isDark ? 'text-[var(--editorial-dark-text)]' : 'text-[var(--text)]'}`}
                >
                  {stat.value}
                </dd>
                <dt className="mt-1 text-[11px] font-medium leading-[15px] text-[var(--muted)]">
                  {stat.label}
                </dt>
              </div>
            ))}
          </dl>
        ) : null}

        {bottom.kind === 'benefits' ? (
          <div className="grid gap-2 sm:grid-cols-3">
            {bottom.items.map((benefit) => (
              <div
                className={cn(
                  'flex min-w-0 gap-3 rounded-[var(--radius-md)] border px-3.5 py-3',
                  isDark
                    ? 'border-[var(--editorial-dark-border)]'
                    : 'border-[var(--border-default)]'
                )}
                key={benefit.title}
              >
                <Check
                  aria-hidden="true"
                  className="mt-0.5 h-4 w-4 shrink-0 text-[var(--accent)]"
                  strokeWidth={2}
                />
                <div className="min-w-0">
                  <p
                    className={cn(
                      'text-[13px] font-semibold leading-5',
                      isDark ? 'text-[var(--editorial-dark-text)]' : 'text-[var(--text)]'
                    )}
                  >
                    {benefit.title}
                  </p>
                  <p className="text-[12px] leading-[18px] text-[var(--muted)]">
                    {benefit.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : null}

        {bottom.kind === 'slot' ? (
          bottom.children
        ) : null}
      </div>
    </div>
  );
}
