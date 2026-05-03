'use client';

import { useEffect, useState } from 'react';
import { ArrowUp } from 'lucide-react';
import { usePathname } from 'next/navigation';

function isWorkspacePath(pathname: string | null) {
  return Boolean(pathname?.startsWith('/admin') || pathname?.startsWith('/business') || pathname?.startsWith('/auth'));
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
      className="fixed right-4 bottom-4 z-40 inline-flex h-12 w-12 items-center justify-center rounded-full border border-black/12 bg-[color-mix(in_oklab,var(--surface),white_34%)] text-[var(--graphite)] shadow-[0_16px_34px_rgba(20,20,18,0.12)] backdrop-blur transition duration-200 hover:border-[var(--accent)] hover:text-[var(--accent)] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--accent)] sm:right-6 sm:bottom-6"
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
