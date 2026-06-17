'use client';

import { useActionState } from 'react';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { subscribeToContentAction, type ContentSubscribeState } from '@/lib/notifications/email-subscription/subscribe-content-action';
import { cn } from '@/lib/utils';

type ContentSubscribeFormProps = {
  topic: string;
  label?: string;
  className?: string;
};

const initialState: ContentSubscribeState = null;

export function ContentSubscribeForm({ topic, label = 'Уведомить о новых', className }: ContentSubscribeFormProps) {
  const [state, formAction, pending] = useActionState(subscribeToContentAction, initialState);

  if (state?.type === 'success') {
    return (
      <p className="text-sm text-[var(--accent-strong)]">
        {state.message}
      </p>
    );
  }

  return (
    <form action={formAction} className={cn('flex flex-wrap items-end gap-2', className)}>
      <input name="topic" type="hidden" value={topic} />
      <div className="min-w-0 flex-1">
        <label className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.1em] text-[var(--muted)]" htmlFor="content-subscribe-email">
          {label}
        </label>
        <Input
          className="h-11"
          id="content-subscribe-email"
          name="email"
          placeholder="your@email.ru"
          required
          type="email"
        />
      </div>
      <Button
        className="min-h-11 shrink-0 rounded-[var(--radius-md)] px-4 text-[12px] uppercase tracking-[0.06em]"
        disabled={pending}
        type="submit"
        variant="primary"
      >
        <Bell size={14} strokeWidth={1.8} />
        {pending ? 'Отправка...' : 'Подписаться'}
      </Button>
      {state?.type === 'error' ? (
        <p className="w-full text-sm text-[var(--danger)]">{state.message}</p>
      ) : null}
    </form>
  );
}
