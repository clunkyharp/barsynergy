'use client';

import { ArrowDown } from 'lucide-react';
import { Button } from '@/components/ui/button';

type StickySectionNavProps = {
  targetId: string;
  label: string;
};

export function StickySectionNav({ targetId, label }: StickySectionNavProps) {
  function handleClick() {
    const el = document.getElementById(targetId);

    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  }

  return (
    <div className="sticky bottom-0 z-40 border-t border-[var(--line)] bg-[var(--surface)]/95 backdrop-blur-[8px] md:hidden">
      <div className="container px-4 py-3">
        <Button className="w-full rounded-[var(--radius-md)]" onClick={handleClick} size="lg">
          {label}
          <ArrowDown aria-hidden size={16} strokeWidth={1.8} />
        </Button>
      </div>
    </div>
  );
}
