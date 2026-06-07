'use client';

import { useEffect, useRef } from 'react';
import { ConversationSender } from '@prisma/client';
import { ComposeBox } from './compose-box';
import { markConversationMessagesRead } from '@/lib/messaging/mark-messages-read';

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
  const markedRef = useRef(false);

  useEffect(() => {
    if (markedRef.current) return;
    markedRef.current = true;

    void markConversationMessagesRead(applicationId, currentUserRole);
  }, [applicationId, currentUserRole]);

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
