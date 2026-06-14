'use client';

export const NEWSLETTER_MODAL_STORAGE_KEY = 'bs:newsletter-modal';
export const NEWSLETTER_MODAL_SESSION_KEY = 'bs:newsletter-shown';

export const DISMISS_COOLDOWN_ONE_MS = 30 * 24 * 60 * 60 * 1000;
export const DISMISS_COOLDOWN_TWO_MS = 180 * 24 * 60 * 60 * 1000;
export const REMIND_LATER_COOLDOWN_MS = 7 * 24 * 60 * 60 * 1000;

type NewsletterModalState = {
  dismissCount: number;
  remindLaterAt?: string;
  shownAt?: string;
  subscribed?: boolean;
};

function parseNewsletterModalState(raw: string | null): NewsletterModalState {
  if (!raw) return { dismissCount: 0, subscribed: false };

  try {
    const parsed = JSON.parse(raw) as Partial<NewsletterModalState>;
    return {
      dismissCount: typeof parsed.dismissCount === 'number' ? parsed.dismissCount : 0,
      remindLaterAt: typeof parsed.remindLaterAt === 'string' ? parsed.remindLaterAt : undefined,
      shownAt: typeof parsed.shownAt === 'string' ? parsed.shownAt : undefined,
      subscribed: parsed.subscribed === true
    };
  } catch {
    return { dismissCount: 0, subscribed: false };
  }
}

function readNewsletterModalState() {
  if (typeof window === 'undefined') return { dismissCount: 0, subscribed: false };
  return parseNewsletterModalState(window.localStorage.getItem(NEWSLETTER_MODAL_STORAGE_KEY));
}

function writeNewsletterModalState(state: NewsletterModalState) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(NEWSLETTER_MODAL_STORAGE_KEY, JSON.stringify(state));
}

function getCooldownUntil(state: NewsletterModalState) {
  if (state.subscribed || state.dismissCount >= 3) return Number.POSITIVE_INFINITY;

  const remindLaterTime = state.remindLaterAt ? Date.parse(state.remindLaterAt) + REMIND_LATER_COOLDOWN_MS : 0;
  const shownTime = state.shownAt ? Date.parse(state.shownAt) : 0;
  const dismissCooldown =
    state.dismissCount === 1
      ? DISMISS_COOLDOWN_ONE_MS
      : state.dismissCount === 2
        ? DISMISS_COOLDOWN_TWO_MS
        : 0;

  return Math.max(remindLaterTime, shownTime + dismissCooldown);
}

export function canShowNewsletterModal(now = Date.now()) {
  if (typeof window === 'undefined') return false;
  if (window.sessionStorage.getItem(NEWSLETTER_MODAL_SESSION_KEY) === '1') return false;

  const state = readNewsletterModalState();
  return now >= getCooldownUntil(state);
}

export function markNewsletterModalShownThisSession() {
  if (typeof window === 'undefined') return;
  window.sessionStorage.setItem(NEWSLETTER_MODAL_SESSION_KEY, '1');
}

export function markNewsletterModalShown(now = new Date()) {
  const state = readNewsletterModalState();
  writeNewsletterModalState({ ...state, shownAt: now.toISOString() });
  markNewsletterModalShownThisSession();
}

export function markNewsletterModalDismissed(now = new Date()) {
  const state = readNewsletterModalState();
  const dismissCount = state.dismissCount + 1;
  writeNewsletterModalState({ ...state, dismissCount, shownAt: now.toISOString() });
  console.info('newsletter_modal_dismissed', { dismissCount, action: 'close' });
}

export function markNewsletterModalRemindLater(now = new Date()) {
  const state = readNewsletterModalState();
  writeNewsletterModalState({ ...state, remindLaterAt: now.toISOString() });
  console.info('newsletter_modal_dismissed', { dismissCount: state.dismissCount, action: 'remind' });
}

export function markNewsletterModalNever(now = new Date()) {
  const state = readNewsletterModalState();
  writeNewsletterModalState({ ...state, dismissCount: 3, shownAt: now.toISOString() });
  console.info('newsletter_modal_dismissed', { dismissCount: 3, action: 'never' });
}

export function markNewsletterModalSubscribed() {
  const state = readNewsletterModalState();
  writeNewsletterModalState({ ...state, subscribed: true });
}
