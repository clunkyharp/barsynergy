'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

const SECTION_SELECTOR = '.site-main > section, .site-main > div > section';
const CHILD_SELECTOR = [
  '.home-section-card',
  '.home-role-card',
  '.home-event-card',
  '.home-service-card',
  '.public-card-shell',
  '.public-list-row-shell',
  '.education-format-card'
].join(', ');

function isHeroSection(section: Element) {
  return section.classList.contains('background-zone-hero') || section.getAttribute('id') === 'home-hero';
}

export function ViewportReveal() {
  const pathname = usePathname();

  useEffect(() => {
    if (pathname !== '/') {
      return;
    }

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const sections = Array.from(document.querySelectorAll<HTMLElement>(SECTION_SELECTOR)).filter((section, index) => index > 0 && !isHeroSection(section));
    const revealItems = sections.flatMap((section) => [section, ...Array.from(section.querySelectorAll<HTMLElement>(CHILD_SELECTOR))]);

    if (revealItems.length === 0) {
      return;
    }

    if (prefersReducedMotion || typeof IntersectionObserver === 'undefined') {
      revealItems.forEach((item) => {
        item.dataset.revealState = 'visible';
      });
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) {
            return;
          }

          const target = entry.target as HTMLElement;
          target.dataset.revealState = 'visible';
          observer.unobserve(target);
        });
      },
      { rootMargin: '0px 0px -12% 0px', threshold: 0.14 }
    );

    revealItems.forEach((item, index) => {
      item.dataset.revealState = 'pending';
      item.style.setProperty('--reveal-delay', `${Math.min(index % 4, 3) * 100}ms`);
      observer.observe(item);
    });

    return () => {
      observer.disconnect();
      revealItems.forEach((item) => {
        item.removeAttribute('data-reveal-state');
        item.style.removeProperty('--reveal-delay');
      });
    };
  }, [pathname]);

  return null;
}
