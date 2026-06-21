"use client";

import { useActionState } from "react";
import { Bell, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { InlineLink } from "@/components/ui/inline-link";
import {
  subscribeToContentAction,
  type ContentSubscribeState,
} from "@/lib/notifications/email-subscription/subscribe-content-action";
import { cn } from "@/lib/utils";

type ContentSubscribeFormProps = {
  topic: string;
  label?: string;
  className?: string;
  stack?: boolean;
};

const initialState: ContentSubscribeState = null;

export function ContentSubscribeForm({
  topic,
  label = "Уведомить о новых",
  className,
  stack = false,
}: ContentSubscribeFormProps) {
  const [state, formAction, pending] = useActionState(
    subscribeToContentAction,
    initialState,
  );

  if (state?.type === "success") {
    return (
      <div
        className={cn(
          "flex min-h-11 max-w-xl items-center gap-2.5 rounded-[var(--radius-md)] border border-[var(--accent)]/35 bg-[var(--accent-soft)] px-4 py-3",
          className,
        )}
        role="status"
      >
        <Check
          aria-hidden="true"
          className="shrink-0 text-[var(--accent-strong)]"
          size={16}
          strokeWidth={2.2}
        />
        <p className="text-sm font-medium text-[var(--text)]">
          {state.message}
        </p>
      </div>
    );
  }

  return (
    <form action={formAction} className={cn("max-w-xl", className)}>
      <input name="topic" type="hidden" value={topic} />
      <div className={cn("flex gap-2", stack ? "flex-col items-stretch" : "flex-wrap items-end")}>
        <div className="min-w-0 flex-1">
          <label
            className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.1em] text-[var(--muted)]"
            htmlFor="content-subscribe-email"
          >
            {label}
          </label>
          <Input
            aria-describedby="content-subscribe-note"
            className="h-11"
            id="content-subscribe-email"
            name="email"
            placeholder="your@email.ru"
            required
            type="email"
          />
        </div>
        <Button
          className={cn(
            "h-[52px] shrink-0 rounded-[var(--radius-md)] px-4 text-[12px] uppercase tracking-[0.06em]",
            stack && "w-full justify-center",
          )}
          disabled={pending}
          type="submit"
          variant="primary"
        >
          <Bell size={14} strokeWidth={1.8} />
          {pending ? "Отправка..." : "Подписаться"}
        </Button>
      </div>
      <p
        className="mt-2 text-[12px] leading-5 text-[var(--muted)]"
        id="content-subscribe-note"
      >
        Письма только о новых событиях.{" "}
        <InlineLink href="/legal/privacy">
          Политика конфиденциальности
        </InlineLink>
        .
      </p>
      {state?.type === "error" ? (
        <p className="mt-2 text-sm text-[var(--danger)]" role="alert">
          {state.message}
        </p>
      ) : null}
    </form>
  );
}
