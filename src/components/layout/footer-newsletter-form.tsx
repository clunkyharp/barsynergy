'use client';

import { useActionState } from 'react';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { InlineLink } from '@/components/ui/inline-link';
import {
  submitNewsletterSubscriptionAction,
  type NewsletterSubscriptionActionState
} from '@/lib/notifications/email-subscription/actions';
import { DEFAULT_NEWSLETTER_TOPICS } from '@/lib/notifications/email-subscription/schema';

const defaultState: NewsletterSubscriptionActionState = null;

export function FooterNewsletterForm() {
  const [result, formAction, isPending] = useActionState(submitNewsletterSubscriptionAction, defaultState);
  const isSuccess = result?.type === 'success';

  return (
    <div className="mt-7 max-w-md">
      <p className="text-sm leading-7 text-[var(--editorial-dark-muted)]">
        Подпишитесь на рассылку и получайте свежие вакансии, анонсы событий и полезные материалы каждую неделю.
      </p>

      {isSuccess ? (
        <p className="mt-4 rounded-[var(--radius-md)] border border-[var(--success-border)] bg-[var(--success-bg)] px-4 py-3 text-sm leading-6 text-[var(--success-text)]">
          {result.message}
        </p>
      ) : (
        <form action={formAction} className="mt-4">
          {DEFAULT_NEWSLETTER_TOPICS.map((topic) => (
            <input key={topic} name="topics" type="hidden" value={topic} />
          ))}
          <input name="consent" type="hidden" value="accepted" />
          <div className="flex flex-col gap-3 sm:flex-row">
            <input
              aria-label="Ваш email"
              autoComplete="email"
              className="min-h-12 w-full rounded-[var(--radius-md)] border border-[var(--editorial-dark-border)] bg-[var(--editorial-dark-surface-muted)] px-4 text-sm text-[var(--editorial-dark-text)] placeholder:text-[var(--editorial-dark-muted)] focus-visible:border-[var(--accent)]/45 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
              name="email"
              placeholder="Ваш email"
              required
              type="email"
            />
            <Button className="shrink-0" loading={isPending} loadingText="Отправляем" type="submit">
              Подписаться
              <ArrowRight aria-hidden="true" size={16} strokeWidth={1.8} />
            </Button>
          </div>

          {result?.type === 'error' ? (
            <p className="mt-3 rounded-[var(--radius-sm)] border border-[var(--danger-border)] bg-[var(--danger-bg)] px-3 py-2 text-sm text-[var(--danger-text)]">
              {result.message}
            </p>
          ) : null}

          <p className="mt-3 text-xs leading-5 text-[var(--editorial-dark-muted)]">
            Нажимая «Подписаться», вы принимаете{' '}
            <InlineLink href="/legal/privacy">политику обработки персональных данных</InlineLink>.
          </p>
        </form>
      )}
    </div>
  );
}
