'use client';

import { useEffect, useState } from 'react';
import { ArrowUp } from 'lucide-react';
import { usePathname } from 'next/navigation';

function isWorkspacePath(pathname: string | null) {
  return Boolean(pathname?.startsWith('/admin') || pathname?.startsWith('/business/cabinet') || pathname?.startsWith('/auth'));
}

export function ScrollToTopButton() {
  const pathname = usePathname();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    function handleScroll() {
      setIsVisible(window.scrollY > 480);
    }

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  if (isWorkspacePath(pathname)) {
    return null;
  }

  return (
    <button
      aria-hidden={!isVisible}
      aria-label="Наверх"
      className="fixed right-4 bottom-[calc(1rem+env(safe-area-inset-bottom))] z-30 inline-flex h-12 w-12 items-center justify-center rounded-full border border-[var(--border-default)] bg-[var(--surface-wash-strong)] text-[var(--graphite)] shadow-[0_16px_34px_rgba(20,20,18,0.12)] backdrop-blur transition-[opacity,transform,border-color,color,background-color] duration-[var(--motion-duration-base)] ease-[var(--motion-ease-standard)] hover:border-[var(--accent)] hover:text-[var(--accent)] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--accent)] motion-reduce:transition-none sm:right-6 sm:bottom-[calc(1.5rem+env(safe-area-inset-bottom))]"
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      style={{
        opacity: isVisible ? 1 : 0,
        pointerEvents: isVisible ? 'auto' : 'none',
        transform: isVisible ? 'translateY(0)' : 'translateY(12px)'
      }}
      type="button"
    >
      <ArrowUp size={18} />
    </button>
  );
}
