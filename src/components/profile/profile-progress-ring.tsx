'use client';

import { useEffect, useState } from 'react';

export function ProfileProgressRing({ percent }: { percent: number }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const target = percent * 0.979;
  const dash = mounted ? target : 0;

  return (
    <div className="relative flex h-14 w-14 shrink-0 items-center justify-center">
      <svg aria-hidden="true" className="absolute inset-0 h-full w-full -rotate-90" viewBox="0 0 36 36">
        <circle cx="18" cy="18" fill="none" r="15.5" stroke="var(--line)" strokeWidth="3" />
        <circle
          cx="18"
          cy="18"
          fill="none"
          r="15.5"
          stroke="var(--accent)"
          strokeDasharray={`${dash} 97.9`}
          strokeLinecap="round"
          strokeWidth="3"
          style={{ transition: mounted ? 'stroke-dasharray 0.65s cubic-bezier(0.4,0,0.2,1)' : 'none' }}
        />
      </svg>
      <span className="text-sm font-bold text-[var(--accent)]">{percent}%</span>
    </div>
  );
}
