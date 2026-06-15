'use client';

import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';

export function HomepageSaveButton() {
  const rootRef = useRef<HTMLSpanElement>(null);
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    const form = rootRef.current?.closest('form');
    if (!form) {
      return;
    }

    const markDirty = () => setIsDirty(true);
    const resetDirty = () => setIsDirty(false);

    form.addEventListener('input', markDirty);
    form.addEventListener('change', markDirty);
    form.addEventListener('submit', resetDirty);

    return () => {
      form.removeEventListener('input', markDirty);
      form.removeEventListener('change', markDirty);
      form.removeEventListener('submit', resetDirty);
    };
  }, []);

  return (
    <span ref={rootRef}>
      <Button aria-disabled={!isDirty} disabled={!isDirty} type="submit">
        Сохранить секцию
      </Button>
    </span>
  );
}
