'use client';

import { useOptimistic, useRef, useState, useTransition, type FormEvent } from 'react';
import { ConversationSender } from '@prisma/client';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { sendConversationMessage } from '@/lib/messaging/send-message';

const MAX_MESSAGE_LENGTH = 2000;

type ComposeBoxProps = {
  applicationId: string;
  senderRole: ConversationSender;
  disabled?: boolean;
  disabledReason?: string;
  placeholder?: string;
  onMessageSent?: () => void;
};

type OptimisticMessage = {
  id: string;
  body: string;
  senderRole: ConversationSender;
  createdAt: Date;
  optimistic: true;
};

export function ComposeBox({
  applicationId,
  senderRole,
  disabled = false,
  disabledReason,
  placeholder = 'Напишите ответ...',
  onMessageSent
}: ComposeBoxProps) {
  const [body, setBody] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [, addOptimistic] = useOptimistic<OptimisticMessage[], OptimisticMessage>(
    [],
    (state, newMsg) => [...state, newMsg]
  );
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const trimmed = body.trim();
  const charCount = trimmed.length;
  const isOverLimit = charCount > MAX_MESSAGE_LENGTH;
  const isEmpty = charCount === 0;
  const isDisabled = disabled || isPending;

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);

    if (isEmpty || isOverLimit || isDisabled) return;

    startTransition(async () => {
      addOptimistic({
        id: `opt-${Date.now()}`,
        body: trimmed,
        senderRole,
        createdAt: new Date(),
        optimistic: true
      });

      setBody('');

      const result = await sendConversationMessage({
        applicationId,
        body: trimmed,
        senderRole
      });

      if (result.type === 'error') {
        setError(result.message);
        setBody(trimmed);
      } else {
        onMessageSent?.();
      }
    });
  }

  return (
    <form
      className="border-t border-[var(--line)] px-5 py-4"
      onSubmit={handleSubmit}
    >
      {disabled && disabledReason ? (
        <p className="py-3 text-center text-[13px] text-[var(--muted)]">
          {disabledReason}
        </p>
      ) : (
        <>
          <div className="relative">
            <Textarea
              className="min-h-[72px] resize-none text-[14px]"
              disabled={isDisabled}
              maxLength={MAX_MESSAGE_LENGTH + 100}
              onChange={(e) => {
                setBody(e.target.value);
                if (error) setError(null);
              }}
              placeholder={placeholder}
              ref={textareaRef}
              rows={2}
              value={body}
            />
          </div>

          <div className="mt-2 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span
                className={`text-[12px] ${isOverLimit ? 'font-medium text-[var(--danger-text)]' : 'text-[var(--muted)]'}`}
              >
                {charCount}/{MAX_MESSAGE_LENGTH}
              </span>
              {error ? (
                <span className="text-[12px] text-[var(--danger-text)]" role="alert">
                  {error}
                </span>
              ) : null}
            </div>

            <Button
              disabled={isDisabled || isEmpty || isOverLimit}
              loading={isPending}
              loadingText="Отправка..."
              size="sm"
              type="submit"
            >
              Отправить
            </Button>
          </div>
        </>
      )}
    </form>
  );
}
