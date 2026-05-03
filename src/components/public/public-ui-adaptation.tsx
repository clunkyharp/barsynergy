import type { ComponentType, HTMLAttributes, ReactNode } from 'react';
import { ArrowUpRight, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type IconComponent = ComponentType<{ className?: string; size?: number; strokeWidth?: number }>;

type IconBadgeTone = 'default' | 'accent' | 'inverse' | 'soft';

const iconBadgeTones: Record<IconBadgeTone, string> = {
  default: 'border-black/10 bg-[rgba(255,250,244,0.8)] text-[var(--text)]',
  accent: 'border-[var(--accent)]/22 bg-[var(--accent)]/7 text-[var(--accent)]',
  inverse: 'border-white/14 bg-white/8 text-white',
  soft: 'border-[rgba(191,168,143,0.38)] bg-[rgba(255,252,248,0.68)] text-[var(--accent)]'
};

export function IconBadge({
  icon: Icon,
  tone = 'accent',
  size = 'md',
  className
}: {
  icon: IconComponent;
  tone?: IconBadgeTone;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        'inline-flex shrink-0 items-center justify-center rounded-full border',
        size === 'sm' && 'h-9 w-9',
        size === 'md' && 'h-12 w-12',
        size === 'lg' && 'h-16 w-16',
        iconBadgeTones[tone],
        className
      )}
    >
      <Icon size={size === 'lg' ? 28 : size === 'md' ? 22 : 18} strokeWidth={1.8} />
    </span>
  );
}

export function FeatureItem({
  icon,
  title,
  description,
  tone = 'accent',
  className
}: {
  icon: IconComponent;
  title: ReactNode;
  description?: ReactNode;
  tone?: IconBadgeTone;
  className?: string;
}) {
  return (
    <div className={cn('grid grid-cols-[auto_minmax(0,1fr)] gap-4', className)}>
      <IconBadge icon={icon} size="sm" tone={tone} />
      <div className="min-w-0">
        <p className="text-sm font-semibold leading-6 text-[var(--text)]">{title}</p>
        {description ? <p className="mt-1 text-sm leading-6 text-[var(--muted)]">{description}</p> : null}
      </div>
    </div>
  );
}

export function CardActionRow({
  children,
  className,
  ...props
}: HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
}) {
  return (
    <div className={cn('mt-6 flex flex-wrap items-center gap-3 border-t border-black/10 pt-5', className)} {...props}>
      {children}
    </div>
  );
}

export function FilterChip({
  children,
  selected = false,
  href,
  onRemove,
  className
}: {
  children: ReactNode;
  selected?: boolean;
  href?: string;
  onRemove?: () => void;
  className?: string;
}) {
  const chipClassName = cn(
    'inline-flex min-h-10 max-w-full items-center gap-2 rounded-full border px-4 text-[11px] font-semibold uppercase tracking-[0.1em] transition-colors',
    selected
      ? 'border-[var(--accent)] bg-[var(--accent)] text-white'
      : 'border-black/10 bg-[rgba(255,252,248,0.82)] text-[var(--text)] hover:border-[var(--accent)]/28 hover:text-[var(--accent)]',
    className
  );

  if (href) {
    return (
      <a className={chipClassName} href={href}>
        {children}
        <ArrowUpRight size={14} strokeWidth={1.8} />
      </a>
    );
  }

  if (onRemove) {
    return (
      <button className={chipClassName} onClick={onRemove} type="button">
        {children}
        <X size={14} strokeWidth={1.8} />
      </button>
    );
  }

  return <span className={chipClassName}>{children}</span>;
}

export function SectionCtaPanel({
  icon,
  title,
  description,
  primary,
  secondary,
  className
}: {
  icon: IconComponent;
  title: ReactNode;
  description: ReactNode;
  primary: { href: string; label: string };
  secondary?: { href: string; label: string };
  className?: string;
}) {
  return (
    <div
      className={cn(
        'grid gap-5 rounded-[var(--radius-xl)] border border-[rgba(191,168,143,0.42)] bg-[linear-gradient(135deg,rgba(255,250,244,0.88),rgba(236,224,206,0.58))] p-5 md:grid-cols-[auto_minmax(0,1fr)_auto] md:items-center md:p-7',
        className
      )}
    >
      <IconBadge icon={icon} size="lg" tone="soft" />
      <div className="min-w-0">
        <h2 className="text-[1.6rem] font-semibold uppercase leading-[1.12] text-[var(--text)] md:text-[2rem]">{title}</h2>
        <p className="mt-2 max-w-2xl text-sm leading-7 text-[var(--muted)]">{description}</p>
      </div>
      <div className="flex flex-col gap-3 sm:flex-row md:flex-col">
        <Button className="rounded-full px-6" href={primary.href}>
          {primary.label}
          <ArrowUpRight size={16} strokeWidth={1.8} />
        </Button>
        {secondary ? (
          <Button className="rounded-full px-6" href={secondary.href} variant="ghost">
            {secondary.label}
            <ArrowUpRight size={16} strokeWidth={1.8} />
          </Button>
        ) : null}
      </div>
    </div>
  );
}
