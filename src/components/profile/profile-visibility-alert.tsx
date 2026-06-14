'use client';

import { useActionState } from 'react';
import { Button } from '@/components/ui/button';
import { InlineAlert } from '@/components/ui/inline-alert';
import type { ProfileActionResult } from '@/lib/profile/profile-action-result';

type ProfileVisibilityAction = (prevState: ProfileActionResult) => Promise<ProfileActionResult>;

type ProfileVisibilityAlertProps = {
  action: ProfileVisibilityAction;
};

export function ProfileVisibilityAlert({ action }: ProfileVisibilityAlertProps) {
  const [result, formAction] = useActionState(action, null);
  const tone = result?.type === 'error' ? 'error' : result?.type === 'success' ? 'success' : 'warning';

  return (
    <InlineAlert className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center" tone={tone}>
      <span>
        {result?.message ?? 'Профиль скрыт от работодателей. Откройте его, чтобы вас могли найти в подборках специалистов.'}
      </span>
      {result?.type === 'success' ? null : (
        <form action={formAction}>
          <Button className="w-full rounded-[var(--radius-md)] sm:w-auto" size="md" type="submit" variant="secondary">
            Открыть профиль
          </Button>
        </form>
      )}
    </InlineAlert>
  );
}
