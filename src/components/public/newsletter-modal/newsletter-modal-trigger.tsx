'use client';

import { useEffect } from 'react';
import { canShowNewsletterModal } from './newsletter-modal-storage';
import { openNewsletterModal } from './newsletter-modal-bus';

const TRIGGER_DELAY_MS = 30_000;
const TRIGGER_SCROLL_DELAY_MS = 10_000;
const TRIGGER_SCROLL_PCT = 50;

export function NewsletterModalTrigger({ disabled = false }: { disabled?: boolean }) {
  useEffect(() => {
    const currentUrl = new URL(window.location.href);
    if (disabled || currentUrl.searchParams.has('application')) return;

    let didTrigger = false;

    const trigger = (type: 'time' | 'scroll') => {
      if (didTrigger || !canShowNewsletterModal()) return;
      didTrigger = true;
      openNewsletterModal(type);
    };

    const timerId = window.setTimeout(() => trigger('time'), TRIGGER_DELAY_MS);

    const handleScroll = () => {
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      if (scrollable <= 0) return;

      const scrollPercent = (window.scrollY / scrollable) * 100;
      if (scrollPercent >= TRIGGER_SCROLL_PCT) {
        trigger('scroll');
      }
    };

    const scrollTimerId = window.setTimeout(() => {
      handleScroll();
      window.addEventListener('scroll', handleScroll, { passive: true });
    }, TRIGGER_SCROLL_DELAY_MS);

    return () => {
      window.clearTimeout(timerId);
      window.clearTimeout(scrollTimerId);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [disabled]);

  return null;
}
