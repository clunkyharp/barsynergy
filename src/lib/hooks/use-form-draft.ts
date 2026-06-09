'use client';

import { useEffect, useRef } from 'react';
import { useToast } from '@/components/ui/toast';

const DRAFT_PREFIX = 'barsynergy-draft-';

export function useFormDraft(formId: string) {
  const storageKey = `${DRAFT_PREFIX}${formId}`;
  const hasDraft = typeof window !== 'undefined' && window.localStorage.getItem(storageKey) !== null;

  function saveDraft(data: Record<string, string>) {
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(data));
    } catch {
      // ignore storage errors
    }
  }

  function loadDraft(): Record<string, string> | null {
    try {
      const raw = window.localStorage.getItem(storageKey);

      if (!raw) return null;

      return JSON.parse(raw) as Record<string, string>;
    } catch {
      return null;
    }
  }

  function clearDraft() {
    try {
      window.localStorage.removeItem(storageKey);
    } catch {
      // ignore storage errors
    }
  }

  return { clearDraft, hasDraft, loadDraft, saveDraft };
}

function restoreFormValues(form: HTMLFormElement, data: Record<string, string>) {
  for (const [key, value] of Object.entries(data)) {
    const control = form.querySelector<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>(
      `[name="${key.replace(/"/g, '\\"')}"]`
    );

    if (control && !control.value) {
      control.value = value;

      control.dispatchEvent(new Event('input', { bubbles: true }));
      control.dispatchEvent(new Event('change', { bubbles: true }));
    }
  }
}

export function useFormDraftAutoSave(formId: string, formRef: React.RefObject<HTMLFormElement | null>) {
  const { clearDraft, loadDraft, saveDraft } = useFormDraft(formId);
  const submittedRef = useRef(false);
  const restoredRef = useRef(false);
  const { showToast } = useToast();

  useEffect(() => {
    const form = formRef.current;

    if (!form || restoredRef.current) return;

    const draft = loadDraft();

    if (draft && Object.keys(draft).length > 0) {
      restoreFormValues(form, draft);
      showToast({ title: 'Черновик восстановлен', tone: 'info' });
    }

    restoredRef.current = true;
  }, [formRef, loadDraft, showToast]);

  useEffect(() => {
    const form = formRef.current;

    if (!form) return;

    function handleInput() {
      if (!form) return;
      const formData = new FormData(form);
      const data: Record<string, string> = {};

      for (const [key, value] of formData.entries()) {
        if (typeof value === 'string') {
          data[key] = value;
        }
      }

      saveDraft(data);
    }

    const debounceTimer: { current: ReturnType<typeof setTimeout> | null } = { current: null };

    function handleChange() {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
      debounceTimer.current = setTimeout(handleInput, 800);
    }

    function handleFormSubmit() {
      submittedRef.current = true;
      clearDraft();
    }

    form.addEventListener('input', handleChange);
    form.addEventListener('change', handleChange);
    form.addEventListener('submit', handleFormSubmit);

    function handleBeforeUnload(event: BeforeUnloadEvent) {
      if (submittedRef.current) return;
      event.preventDefault();
    }

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      form.removeEventListener('input', handleChange);
      form.removeEventListener('change', handleChange);
      form.removeEventListener('submit', handleFormSubmit);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, [formId, formRef, clearDraft, saveDraft]);

  return {};
}
