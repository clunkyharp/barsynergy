'use client';

import { startTransition } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { SegmentedControl } from '@/components/ui/segmented-control';
import type { ConversationStatusGroup } from '@/lib/messaging/conversation-status-groups';

type ConversationListTabsProps = {
  value: ConversationStatusGroup;
};

const items: Array<{ value: ConversationStatusGroup; label: string; description: string }> = [
  { value: 'active', label: 'Активные', description: 'Новые и рабочие диалоги' },
  { value: 'closed', label: 'Закрытые', description: 'Завершено или отклонено' },
  { value: 'archive', label: 'Архив', description: 'Скрытые из работы записи' }
];

export function ConversationListTabs({ value }: ConversationListTabsProps) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  function handleChange(nextValue: ConversationStatusGroup) {
    const params = new URLSearchParams(searchParams.toString());

    if (nextValue === 'active') {
      params.delete('statusGroup');
    } else {
      params.set('statusGroup', nextValue);
    }

    params.delete('page');
    const query = params.toString();

    startTransition(() => {
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    });
  }

  return (
    <SegmentedControl
      className="md:grid-cols-3 xl:grid-cols-3"
      items={items}
      onChange={handleChange}
      value={value}
      variant="compact"
    />
  );
}
