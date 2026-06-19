'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

type ChipFilterRowProps = {
  children: ReactNode;
  className?: string;
  'aria-label'?: string;
};

/**
 * Horizontal, scrollable row of filter chips with edge fades that appear
 * only when there is more content to scroll. Fade color tracks `--background`,
 * which background zones (e.g. graphite) remap, so it adapts to light/dark.
 */
export function ChipFilterRow({ children, className, 'aria-label': ariaLabel }: ChipFilterRowProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [edges, setEdges] = useState({ start: false, end: false });

  useEffect(() => {
    const el = scrollRef.current;

    if (!el) {
      return;
    }

    const update = () => {
      const { scrollLeft, scrollWidth, clientWidth } = el;
      setEdges({
        start: scrollLeft > 4,
        end: scrollLeft + clientWidth < scrollWidth - 4
      });
    };

    update();
    el.addEventListener('scroll', update, { passive: true });

    const observer = new ResizeObserver(update);
    observer.observe(el);

    return () => {
      el.removeEventListener('scroll', update);
      observer.disconnect();
    };
  }, []);

  return (
    <div className="relative">
      <div
        ref={scrollRef}
        aria-label={ariaLabel}
        className={cn(
          'flex items-center gap-2 overflow-x-auto scrollbar-none pb-1 [scroll-snap-type:x_proximity]',
          className
        )}
      >
        {children}
      </div>
      <div
        aria-hidden="true"
        className={cn(
          'pointer-events-none absolute inset-y-0 left-0 w-10 bg-gradient-to-r from-[var(--background)] to-transparent transition-opacity duration-[var(--motion-duration-fast)] motion-reduce:transition-none',
          edges.start ? 'opacity-100' : 'opacity-0'
        )}
      />
      <div
        aria-hidden="true"
        className={cn(
          'pointer-events-none absolute inset-y-0 right-0 w-10 bg-gradient-to-l from-[var(--background)] to-transparent transition-opacity duration-[var(--motion-duration-fast)] motion-reduce:transition-none',
          edges.end ? 'opacity-100' : 'opacity-0'
        )}
      />
    </div>
  );
}
