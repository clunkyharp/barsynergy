import type { AnchorHTMLAttributes } from 'react';
import { AppLink } from '@/components/ui/app-link';
import { cn } from '@/lib/utils';

type InlineLinkProps = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> & {
  href: string;
};

export function InlineLink({ className, ...props }: InlineLinkProps) {
  return <AppLink className={cn('font-semibold text-[var(--accent-ink)] underline-offset-4 hover:underline', className)} {...props} />;
}
