'use client';
export type LeadModalKey = 'vacancy' | 'event' | 'education' | 'supplier';

const EVENT_NAME = 'barsynergy:open-lead-modal';

export function openLeadModal(key: LeadModalKey) {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent<LeadModalKey>(EVENT_NAME, { detail: key }));
}

export function subscribeLeadModal(key: LeadModalKey, handler: () => void) {
  if (typeof window === 'undefined') return () => {};
  const listener = (event: Event) => {
    if ((event as CustomEvent<LeadModalKey>).detail === key) handler();
  };
  window.addEventListener(EVENT_NAME, listener);
  return () => window.removeEventListener(EVENT_NAME, listener);
}
