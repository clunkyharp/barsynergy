import type { HTMLAttributes } from 'react';
import { StatusBadge, type StatusBadgeVariant } from '@/components/ui/status-badge';

type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  variant?: StatusBadgeVariant;
};

// Compatibility alias. New status UI should prefer StatusBadge directly.
export function Badge({ variant = 'neutral', ...props }: BadgeProps) {
  return <StatusBadge variant={variant} {...props} />;
}
