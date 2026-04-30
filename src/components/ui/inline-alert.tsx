import type { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

type InlineAlertTone = 'info' | 'success' | 'warning' | 'error' | 'destructive' | 'neutral';
type InlineAlertDensity = 'default' | 'compact';

type InlineAlertProps = HTMLAttributes<HTMLDivElement> & {
  tone?: InlineAlertTone;
  density?: InlineAlertDensity;
};

export function InlineAlert({ className, tone = 'info', density = 'default', ...props }: InlineAlertProps) {
  return (
    <div
      className={cn('inline-alert text-sm leading-6', density === 'compact' && 'px-3 py-3 text-[13px] leading-5', className)}
      data-tone={tone}
      role={tone === 'error' || tone === 'destructive' ? 'alert' : 'status'}
      {...props}
    />
  );
}
