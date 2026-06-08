'use client';

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';

type UnsavedChangesContextType = {
  isDirty: boolean;
  markDirty: () => void;
  resetDirty: () => void;
};

const UnsavedChangesContext = createContext<UnsavedChangesContextType>({
  isDirty: false,
  markDirty: () => {},
  resetDirty: () => {}
});

export function UnsavedChangesProvider({ children }: { children: ReactNode }) {
  const [isDirty, setIsDirty] = useState(false);
  const markDirty = useCallback(() => setIsDirty(true), []);
  const resetDirty = useCallback(() => setIsDirty(false), []);

  useEffect(() => {
    if (!isDirty) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [isDirty]);

  return (
    <UnsavedChangesContext.Provider value={{ isDirty, markDirty, resetDirty }}>
      {children}
    </UnsavedChangesContext.Provider>
  );
}

export function useUnsavedChanges() {
  return useContext(UnsavedChangesContext);
}

export function useFormDirtyDetection(formRef: React.RefObject<HTMLFormElement | null>) {
  const { markDirty, resetDirty } = useUnsavedChanges();

  useEffect(() => {
    const form = formRef.current;
    if (!form) return;
    const handler = () => markDirty();
    form.addEventListener('change', handler);
    form.addEventListener('input', handler);
    return () => {
      form.removeEventListener('change', handler);
      form.removeEventListener('input', handler);
    };
  }, [formRef, markDirty]);

  return { resetDirty };
}

export function useCmdSubmit(formRef: React.RefObject<HTMLFormElement | null>) {
  useEffect(() => {
    const form = formRef.current;
    if (!form) return;
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault();
        form.requestSubmit();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [formRef]);
}
