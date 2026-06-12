import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface FeatureLabelProps {
  icon: React.ComponentType<{ className?: string; size?: number; strokeWidth?: number }>;
  children: ReactNode;
  className?: string;
  iconClassName?: string;
  size?: number;
  accent?: boolean;
}

export function FeatureLabel({
  icon: Icon,
  children,
  className,
  iconClassName,
  size = 14,
  accent = true,
}: FeatureLabelProps) {
  return (
    <span className={cn('inline-flex items-center gap-2', className)}>
      <Icon
        className={cn(
          'shrink-0',
          accent ? 'text-[var(--accent)]' : 'text-[var(--text)]',
          iconClassName,
        )}
        size={size}
        strokeWidth={1.8}
      />
      <span className="leading-none">{children}</span>
    </span>
  );
}
