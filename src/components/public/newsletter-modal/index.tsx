'use client';

import { useActionState, useEffect, useMemo, useRef, useState } from 'react';
import { ArrowRight, X } from 'lucide-react';
import { Dialog } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CheckboxField } from '@/components/ui/checkbox-field';
import { ConsentField } from '@/components/ui/consent-field';
import { InlineLink } from '@/components/ui/inline-link';
import { Input } from '@/components/ui/input';
import { DEFAULT_NEWSLETTER_TOPICS, newsletterTopicOptions } from '@/lib/notifications/email-subscription/schema';
import {
  submitNewsletterSubscriptionAction,
  type NewsletterSubscriptionActionState
} from '@/lib/notifications/email-subscription/actions';
import { cn } from '@/lib/utils';
import { subscribeNewsletterModal, type NewsletterModalTriggerType } from './newsletter-modal-bus';
import {
  markNewsletterModalDismissed,
  markNewsletterModalNever,
  markNewsletterModalRemindLater,
  markNewsletterModalShown,
  markNewsletterModalSubscribed
} from './newsletter-modal-storage';

type NewsletterModalRootProps = {
  userEmail?: string | null;
  subscribed?: boolean;
};

const defaultState: NewsletterSubscriptionActionState = null;

export function NewsletterModalRoot({ userEmail, subscribed = false }: NewsletterModalRootProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [lastTrigger, setLastTrigger] = useState<NewsletterModalTriggerType>('manual');
  const [result, formAction, isPending] = useActionState(submitNewsletterSubscriptionAction, defaultState);
  const emailRef = useRef<HTMLInputElement>(null);
  const isSuccess = result?.type === 'success';
  const hasAccountEmail = Boolean(userEmail);

  const selectedDefaults = useMemo(
    () => new Set<string>(DEFAULT_NEWSLETTER_TOPICS),
    []
  );

  useEffect(() => {
    if (subscribed) return;

    return subscribeNewsletterModal((trigger) => {
      setLastTrigger(trigger);
      markNewsletterModalShown();
      setIsOpen(true);
      console.info('newsletter_modal_shown', { trigger, page: window.location.pathname });
    });
  }, [subscribed]);

  useEffect(() => {
    if (isSuccess) {
      markNewsletterModalSubscribed();
      console.info('newsletter_modal_submitted', { trigger: lastTrigger });
    }
  }, [isSuccess, lastTrigger]);

  const softDismiss = () => {
    if (!isSuccess) {
      markNewsletterModalDismissed();
    }
    setIsOpen(false);
  };

  const remindLater = () => {
    markNewsletterModalRemindLater();
    setIsOpen(false);
  };

  const neverShow = () => {
    markNewsletterModalNever();
    setIsOpen(false);
  };

  return (
    <Dialog
      className="overflow-hidden border-[var(--border-strong)] bg-[var(--surface)] p-0"
      closeLabel="Закрыть подписку"
      description="Выберите темы, пришлём подборку по почте."
      hideHeader
      initialFocusRef={hasAccountEmail ? undefined : emailRef}
      onOpenChange={(open) => {
        if (open) {
          setIsOpen(true);
          return;
        }
        remindLater();
      }}
      open={isOpen}
      overlayProps={{
        className: 'newsletter-modal-backdrop'
      }}
      showCloseButton={false}
      size="lg"
      title="Главное из кофейного рынка — раз в неделю"
    >
      <div className="relative px-6 pb-6 pt-5 sm:px-7 sm:pb-7 sm:pt-6">
        <button
          aria-label="Закрыть"
          className="absolute right-4 top-4 inline-flex min-h-9 min-w-9 items-center justify-center rounded-[var(--radius-sm)] border border-[var(--line)] text-lg leading-none text-[var(--muted)] transition-colors duration-[var(--motion-duration-fast)] ease-[var(--motion-ease-standard)] hover:border-[var(--border-strong)] hover:text-[var(--text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-1 motion-reduce:transition-none sm:right-5 sm:top-5"
          onClick={softDismiss}
          type="button"
        >
          <X aria-hidden="true" size={16} strokeWidth={1.8} />
        </button>

        <p className="text-[11px] font-semibold uppercase tracking-[var(--tracking-eyebrow-md)] text-[var(--muted)]">
          BARSYNERGY — еженедельный дайджест
        </p>

        <h2 className="mt-3 text-xl font-semibold leading-tight text-[var(--text)]">
          Главное из кофейного рынка — раз в неделю
        </h2>

        <p className="mt-2 text-sm leading-[22px] text-[var(--muted)]">
          Выберите темы, пришлём подборку по почте.
        </p>

        {isSuccess ? (
          <div className="mt-5 rounded-[var(--radius-lg)] border border-[var(--success-border)] bg-[var(--success-bg)] p-4 text-sm leading-6 text-[var(--success-text)]">
            {result.message}
          </div>
        ) : (
          <form action={formAction} className="mt-5 grid gap-5">
            <div className="grid gap-3">
              {newsletterTopicOptions.map((topic) => (
                <CheckboxField
                  className="rounded-[var(--radius-md)] border border-[var(--line)] bg-[var(--surface-wash)] px-3 py-2 text-sm text-[var(--text)]"
                  defaultChecked={selectedDefaults.has(topic.value)}
                  key={topic.value}
                  name="topics"
                  value={topic.value}
                >
                  {topic.label}
                </CheckboxField>
              ))}
            </div>

            {hasAccountEmail ? (
              <input name="email" type="hidden" value={userEmail ?? ''} />
            ) : (
              <Input
                autoComplete="email"
                id="newsletter-email"
                name="email"
                placeholder="your@email.ru"
                ref={emailRef}
                required
                type="email"
              />
            )}

            <ConsentField density="compact">
              Принимаю{' '}
              <InlineLink href="/legal/privacy">политику обработки персональных данных</InlineLink>
              {' и согласен на отправку email-рассылки.'}
            </ConsentField>

            {result?.type === 'error' ? (
              <p className="rounded-[var(--radius-sm)] border border-[var(--danger-border)] bg-[var(--danger-bg)] px-3 py-2 text-sm text-[var(--danger-text)]">
                {result.message}
              </p>
            ) : null}

            <Button className="w-full" loading={isPending} loadingText="Отправляем" type="submit">
              Подписаться
              <ArrowRight aria-hidden="true" size={16} strokeWidth={1.8} />
            </Button>
          </form>
        )}

        <div
          className={cn(
            'mt-4 flex flex-wrap items-center justify-center gap-x-3 gap-y-2 text-xs text-[var(--muted)]',
            isSuccess && 'justify-start'
          )}
        >
          {!isSuccess ? (
            <>
              <button
                className="min-h-8 text-[var(--muted)] underline-offset-4 hover:text-[var(--text)] hover:underline focus-visible:text-[var(--text)] focus-visible:underline focus-visible:outline-offset-2"
                onClick={remindLater}
                type="button"
              >
                Напомнить позже
              </button>
              <span aria-hidden="true" className="text-[var(--line)]">·</span>
              <button
                className="min-h-8 text-[var(--muted)] underline-offset-4 hover:text-[var(--text)] hover:underline focus-visible:text-[var(--text)] focus-visible:underline focus-visible:outline-offset-2"
                onClick={neverShow}
                type="button"
              >
                Больше не показывать
              </button>
            </>
          ) : (
            <button
              className="min-h-8 text-[var(--muted)] underline-offset-4 hover:text-[var(--text)] hover:underline focus-visible:text-[var(--text)] focus-visible:underline focus-visible:outline-offset-2"
              onClick={() => setIsOpen(false)}
              type="button"
            >
              Закрыть
            </button>
          )}
        </div>
      </div>
    </Dialog>
  );
}
