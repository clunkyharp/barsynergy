'use client';

export type NewsletterModalTriggerType = 'time' | 'scroll' | 'manual';

const EVENT_NAME = 'barsynergy:open-newsletter-modal';

export function openNewsletterModal(trigger: NewsletterModalTriggerType = 'manual') {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent<NewsletterModalTriggerType>(EVENT_NAME, { detail: trigger }));
}

export function subscribeNewsletterModal(handler: (trigger: NewsletterModalTriggerType) => void) {
  if (typeof window === 'undefined') return () => {};

  const listener = (event: Event) => {
    handler((event as CustomEvent<NewsletterModalTriggerType>).detail ?? 'manual');
  };

  window.addEventListener(EVENT_NAME, listener);
  return () => window.removeEventListener(EVENT_NAME, listener);
}
