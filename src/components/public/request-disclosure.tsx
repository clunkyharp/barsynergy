'use client';

import type { ReactNode } from 'react';
import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { Button, type ButtonSize, type ButtonVariant } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const OPEN_EVENT = 'barsynergy-request-disclosure-open';
const STATE_EVENT = 'barsynergy-request-disclosure-state';

type OpenEventDetail = {
  id: string;
};

type StateEventDetail = {
  id: string;
  open: boolean;
};

type RequestDisclosureProps = {
  id: string;
  aliases?: string[];
  children: ReactNode;
  className?: string;
  closedContent?: ReactNode;
  defaultOpen?: boolean;
  description?: string;
  focusSelector?: string;
  openLabel?: string;
  showDefaultTrigger?: boolean;
  title?: string;
};

type RequestDisclosureTriggerProps = {
  children: ReactNode;
  className?: string;
  href?: string;
  size?: ButtonSize;
  targetId: string;
  variant?: ButtonVariant;
};

const defaultFocusSelector = [
  'input:not([type="hidden"]):not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  'button:not([disabled])'
].join(',');

function cleanHash(value: string) {
  return value.replace(/^#/, '').trim();
}

function matchesTarget(hash: string, id: string, aliases: string[]) {
  const target = cleanHash(hash);

  return Boolean(target) && (target === id || aliases.includes(target));
}

function requestAnimationFrameSafe(callback: () => void) {
  if (typeof window === 'undefined') {
    return 0;
  }

  return window.requestAnimationFrame(callback);
}

function focusFirstField(root: HTMLElement, selector: string) {
  const target = root.querySelector<HTMLElement>(selector);

  if (!target) {
    return;
  }

  target.focus({ preventScroll: true });
}

export function RequestDisclosure({
  aliases = [],
  children,
  className,
  closedContent,
  defaultOpen = false,
  description = 'Откройте форму, заполните данные и отправьте заявку.',
  focusSelector = defaultFocusSelector,
  id,
  openLabel = 'Заполнить форму',
  showDefaultTrigger = true,
  title = 'Заполнить заявку'
}: RequestDisclosureProps) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const panelId = `${id}-panel`;
  const [open, setOpen] = useState(defaultOpen);

  useEffect(() => {
    if (defaultOpen) {
      setOpen(true);
    }
  }, [defaultOpen]);

  useEffect(() => {
    function openFromHash() {
      if (matchesTarget(window.location.hash, id, aliases)) {
        setOpen(true);
      }
    }

    openFromHash();
    window.addEventListener('hashchange', openFromHash);

    return () => window.removeEventListener('hashchange', openFromHash);
  }, [aliases, id]);

  useEffect(() => {
    function handleOpen(event: Event) {
      const detail = (event as CustomEvent<OpenEventDetail>).detail;

      if (detail?.id === id || aliases.includes(detail?.id ?? '')) {
        setOpen(true);
      }
    }

    window.addEventListener(OPEN_EVENT, handleOpen);

    return () => window.removeEventListener(OPEN_EVENT, handleOpen);
  }, [aliases, id]);

  useEffect(() => {
    window.dispatchEvent(new CustomEvent<StateEventDetail>(STATE_EVENT, { detail: { id, open } }));

    if (!open) {
      return;
    }

    const frame = requestAnimationFrameSafe(() => {
      sectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      if (sectionRef.current) {
        focusFirstField(sectionRef.current, focusSelector);
      }
    });

    return () => window.cancelAnimationFrame(frame);
  }, [focusSelector, id, open]);

  function handleOpenClick() {
    window.history.replaceState(null, '', `#${id}`);
    setOpen(true);
  }

  return (
    <div className={cn('scroll-mt-28', className)} id={id} ref={sectionRef}>
      {open ? (
        <div id={panelId}>{children}</div>
      ) : (
        <div
          className="rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--surface-wash)] p-5 shadow-[var(--shadow-card)] md:p-6"
          id={panelId}
        >
          {closedContent ?? (
            <div className="max-w-2xl">
              <h3 className="text-lg font-semibold leading-7 text-[var(--text)]">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{description}</p>
            </div>
          )}
          {showDefaultTrigger ? (
            <Button
              aria-controls={panelId}
              aria-expanded={open}
              className="mt-5 rounded-[var(--radius-md)] px-5"
              onClick={handleOpenClick}
              type="button"
            >
              {openLabel}
              <ArrowUpRight size={16} />
            </Button>
          ) : null}
        </div>
      )}
    </div>
  );
}

export function RequestDisclosureTrigger({
  children,
  className,
  href,
  size = 'md',
  targetId,
  variant = 'primary'
}: RequestDisclosureTriggerProps) {
  const generatedId = useId();
  const [expanded, setExpanded] = useState(false);
  const targetHref = href ?? `#${targetId}`;
  const isLocalHash = targetHref.startsWith('#');
  const ariaControls = useMemo(() => `${targetId}-panel`, [targetId]);

  useEffect(() => {
    function handleState(event: Event) {
      const detail = (event as CustomEvent<StateEventDetail>).detail;

      if (detail?.id === targetId) {
        setExpanded(detail.open);
      }
    }

    setExpanded(cleanHash(window.location.hash) === targetId);
    window.addEventListener(STATE_EVENT, handleState);

    return () => window.removeEventListener(STATE_EVENT, handleState);
  }, [targetId]);

  if (!isLocalHash) {
    return (
      <Button aria-controls={ariaControls} aria-expanded={expanded} className={className} href={targetHref} size={size} variant={variant}>
        {children}
      </Button>
    );
  }

  return (
    <Button
      aria-controls={ariaControls}
      aria-expanded={expanded}
      className={className}
      id={`${targetId}-trigger-${generatedId}`}
      onClick={() => {
        window.history.pushState(null, '', targetHref);
        window.dispatchEvent(new CustomEvent<OpenEventDetail>(OPEN_EVENT, { detail: { id: targetId } }));
      }}
      size={size}
      type="button"
      variant={variant}
    >
      {children}
    </Button>
  );
}
