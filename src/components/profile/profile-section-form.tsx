'use client';

import type { ReactNode } from 'react';
import { useActionState, useEffect, useRef, useState } from 'react';
import { FieldSuccess } from '@/components/ui/form-field';
import { InlineAlert } from '@/components/ui/inline-alert';
import type { ProfileActionResult } from '@/lib/profile/profile-action-result';
import { requestProfileSettingsSectionOpen } from '@/components/profile/profile-settings-section';

const DRAFT_TTL_MS = 24 * 60 * 60 * 1000;
const DRAFT_KEY_PREFIX = 'profile-draft-';

type ProfileFormAction = (prevState: ProfileActionResult, formData: FormData) => Promise<ProfileActionResult>;

type DraftPayload = {
  savedAt: number;
  fields: Record<string, string | boolean | string[]>;
};

type ProfileSectionFormProps = {
  action: ProfileFormAction;
  children: ReactNode;
  className?: string;
  noValidate?: boolean;
  sectionId: string;
};

function shouldSkipDraftControl(control: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement) {
  if (!control.name) {
    return true;
  }

  if (control instanceof HTMLInputElement) {
    return ['file', 'hidden', 'password', 'submit', 'button', 'reset'].includes(control.type);
  }

  return false;
}

function readDraft(key: string): DraftPayload | null {
  try {
    const raw = window.localStorage.getItem(key);

    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw) as Partial<DraftPayload>;

    if (!parsed.savedAt || Date.now() - parsed.savedAt > DRAFT_TTL_MS || !parsed.fields) {
      window.localStorage.removeItem(key);
      return null;
    }

    return { savedAt: parsed.savedAt, fields: parsed.fields };
  } catch {
    window.localStorage.removeItem(key);
    return null;
  }
}

function getDraftControls(form: HTMLFormElement) {
  return Array.from(form.elements).filter(
    (control): control is HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement =>
      (control instanceof HTMLInputElement || control instanceof HTMLSelectElement || control instanceof HTMLTextAreaElement) &&
      !shouldSkipDraftControl(control)
  );
}

function restoreDraft(form: HTMLFormElement, draft: DraftPayload) {
  for (const control of getDraftControls(form)) {
    const value = draft.fields[control.name];

    if (value === undefined) {
      continue;
    }

    if (control instanceof HTMLInputElement && control.type === 'checkbox') {
      control.checked = Array.isArray(value) ? value.includes(control.value) : value === true;
      continue;
    }

    if (typeof value === 'string') {
      control.value = value;
    }
  }
}

function saveDraft(form: HTMLFormElement, key: string) {
  const fields: DraftPayload['fields'] = {};
  const checkboxGroups = new Set<string>();

  for (const control of getDraftControls(form)) {
    if (control instanceof HTMLInputElement && control.type === 'checkbox') {
      if (checkboxGroups.has(control.name)) {
        continue;
      }

      const group = getDraftControls(form).filter(
        (item): item is HTMLInputElement => item instanceof HTMLInputElement && item.type === 'checkbox' && item.name === control.name
      );

      checkboxGroups.add(control.name);

      if (group.length > 1) {
        fields[control.name] = group.filter((item) => item.checked).map((item) => item.value);
      } else {
        fields[control.name] = control.checked;
      }
    } else {
      fields[control.name] = control.value;
    }
  }

  window.localStorage.setItem(key, JSON.stringify({ savedAt: Date.now(), fields }));
}

export function ProfileSectionForm({ action, children, className, noValidate = true, sectionId }: ProfileSectionFormProps) {
  const [result, formAction] = useActionState(action, null);
  const [savedAt, setSavedAt] = useState('');
  const formRef = useRef<HTMLFormElement>(null);
  const draftKey = `${DRAFT_KEY_PREFIX}${sectionId}`;

  useEffect(() => {
    const form = formRef.current;

    if (!form) {
      return;
    }

    const draft = readDraft(draftKey);

    if (draft) {
      restoreDraft(form, draft);
    }

    const handleDraftChange = () => saveDraft(form, draftKey);

    form.addEventListener('input', handleDraftChange);
    form.addEventListener('change', handleDraftChange);

    return () => {
      form.removeEventListener('input', handleDraftChange);
      form.removeEventListener('change', handleDraftChange);
    };
  }, [draftKey]);

  useEffect(() => {
    if (result?.type !== 'success') {
      return;
    }

    window.localStorage.removeItem(draftKey);
    setSavedAt(new Intl.DateTimeFormat('ru-RU', { hour: '2-digit', minute: '2-digit' }).format(new Date()));
  }, [draftKey, result]);

  useEffect(() => {
    if (result?.type === 'error') {
      requestProfileSettingsSectionOpen(sectionId);
    }
  }, [result, sectionId]);

  return (
    <form
      ref={formRef}
      action={formAction}
      className={className}
      data-ux-event="profile_settings_first_save"
      data-ux-result={result?.type ?? 'idle'}
      data-ux-section={sectionId}
      noValidate={noValidate}
    >
      {children}
      {result?.type === 'success' ? (
        <FieldSuccess data-ux-event-result={result.type}>
          {savedAt ? `${result.message} · Сохранено ${savedAt}` : result.message}
        </FieldSuccess>
      ) : null}
      {result?.type === 'error' ? (
        <InlineAlert data-ux-event-result={result.type} tone="error">
          {result.message}
        </InlineAlert>
      ) : null}
    </form>
  );
}
