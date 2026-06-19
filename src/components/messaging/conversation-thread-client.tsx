'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ConversationSender } from '@prisma/client';
import { ComposeBox } from './compose-box';
import { markConversationMessagesRead } from '@/lib/messaging/mark-messages-read';

const POLL_INTERVAL_MS = 5000;

type ConversationThreadClientProps = {
  applicationId: string;
  currentUserRole: 'user' | 'business' | 'admin';
  senderRole: ConversationSender;
  disabled?: boolean;
  disabledReason?: string;
  placeholder?: string;
};

export function ConversationThreadClient({
  applicationId,
  currentUserRole,
  senderRole,
  disabled,
  disabledReason,
  placeholder
}: ConversationThreadClientProps) {
  const router = useRouter();
  const markedRef = useRef(false);

  useEffect(() => {
    if (markedRef.current) return;
    markedRef.current = true;

    void markConversationMessagesRead(applicationId, currentUserRole);
  }, [applicationId, currentUserRole]);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;

    function startPolling() {
      interval = setInterval(() => {
        if (document.hidden) return;
        router.refresh();
      }, POLL_INTERVAL_MS);
    }

    function onVisibilityChange() {
      if (document.hidden) {
        clearInterval(interval);
      } else {
        router.refresh();
        startPolling();
      }
    }

    startPolling();
    document.addEventListener('visibilitychange', onVisibilityChange);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, [router]);

  return (
    <ComposeBox
      applicationId={applicationId}
      disabled={disabled}
      disabledReason={disabledReason}
      onMessageSent={() => {
        void markConversationMessagesRead(applicationId, currentUserRole);
      }}
      placeholder={placeholder}
      senderRole={senderRole}
    />
  );
}
