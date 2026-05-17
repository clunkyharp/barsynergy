import type { AnchorHTMLAttributes, ReactNode } from 'react';
import Link from 'next/link';

type AppLinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  children?: ReactNode;
  href: string;
};

export function isAppRouteHref(href: string) {
  return href.startsWith('/') && !href.startsWith('//');
}

export function AppLink({ href, ...props }: AppLinkProps) {
  if (isAppRouteHref(href)) {
    return <Link href={href} {...props} />;
  }

  return <a href={href} {...props} />;
}
