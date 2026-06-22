'use client';

import { useCallback, useEffect, useRef } from 'react';

declare global {
  interface Window {
    turnstile?: {
      render: (container: string | HTMLElement, options: Record<string, unknown>) => string;
      getResponse: (widgetId: string) => string | undefined;
      reset: (widgetId: string) => void;
      remove: (widgetId: string) => void;
    };
  }
}

const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

export function Turnstile({
  onVerify,
  className
}: {
  onVerify: (token: string) => void;
  className?: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);

  const onLoadTurnstile = useCallback(() => {
    if (!containerRef.current || !window.turnstile || !siteKey) return;

    if (widgetIdRef.current) {
      window.turnstile.remove(widgetIdRef.current);
    }

    widgetIdRef.current = window.turnstile.render(containerRef.current, {
      sitekey: siteKey,
      callback: (token: string) => {
        onVerify(token);
      },
      'expired-callback': () => {
        onVerify('');
      }
    });
  }, [onVerify]);

  useEffect(() => {
    if (typeof window === 'undefined' || !siteKey) return;

    const cleanup = () => {
      if (widgetIdRef.current && window.turnstile) {
        window.turnstile.remove(widgetIdRef.current);
        widgetIdRef.current = null;
      }
    };

    if (document.querySelector('script[src*="turnstile"]')) {
      onLoadTurnstile();
      return cleanup;
    }

    const script = document.createElement('script');
    script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js';
    script.async = true;
    script.defer = true;
    script.onload = onLoadTurnstile;
    document.head.appendChild(script);

    return cleanup;
  }, [onLoadTurnstile]);

  if (!siteKey) return null;

  return <div ref={containerRef} className={className} />;
}
