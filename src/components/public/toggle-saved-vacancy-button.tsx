'use client';

import { useRouter } from 'next/navigation';
import { Bookmark } from 'lucide-react';
import { cn } from '@/lib/utils';

type ToggleSavedVacancyButtonProps = {
  vacancyId: string;
  initialSaved?: boolean;
  toggleAction: (vacancyId: string) => Promise<{ saved: boolean; error?: string }>;
};

export function ToggleSavedVacancyButton({ vacancyId, initialSaved = false, toggleAction }: ToggleSavedVacancyButtonProps) {
  const router = useRouter();

  return (
    <button
      className={cn(
        'flex w-full min-h-10 items-center justify-center gap-2 whitespace-nowrap rounded-[var(--radius-md)] border border-[var(--border-default)] px-3 text-[12px] font-semibold transition-colors duration-[var(--motion-duration-fast)] hover:bg-[var(--surface-wash)] motion-reduce:transition-none',
        initialSaved && 'text-[var(--accent)] border-[var(--accent)]'
      )}
      onClick={async () => {
        await toggleAction(vacancyId);
        router.refresh();
      }}
      type="button"
      aria-label={initialSaved ? 'Убрать из избранного' : 'Добавить в избранное'}
    >
      <Bookmark size={15} strokeWidth={1.8} fill={initialSaved ? 'currentColor' : 'none'} />
      <span className="hidden sm:inline">{initialSaved ? 'В избранном' : 'В избранное'}</span>
    </button>
  );
}
