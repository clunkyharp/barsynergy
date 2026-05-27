'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode
} from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/lib/utils';

type ToastTone = 'info' | 'success' | 'warning' | 'error';

export type ToastMessage = {
  description?: ReactNode;
  duration?: number;
  id?: string;
  title: ReactNode;
  tone?: ToastTone;
};

type ToastRecord = Required<Pick<ToastMessage, 'id' | 'tone'>> & Omit<ToastMessage, 'id' | 'tone'>;

type ToastContextValue = {
  dismissToast: (id: string) => void;
  showToast: (message: ToastMessage) => string;
};

const ToastContext = createContext<ToastContextValue | null>(null);

const toastToneMarkerClassNames: Record<ToastTone, string> = {
  error: 'bg-[var(--danger)]',
  info: 'bg-[var(--accent)]',
  success: 'bg-[var(--success)]',
  warning: 'bg-[var(--warning)]'
};

function createToastId() {
  return `toast-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastRecord[]>([]);
  const [portalTarget, setPortalTarget] = useState<HTMLElement | null>(null);

  useEffect(() => {
    setPortalTarget(document.body);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback((message: ToastMessage) => {
    const id = message.id ?? createToastId();
    const toast: ToastRecord = {
      ...message,
      id,
      tone: message.tone ?? 'info'
    };

    setToasts((current) => [toast, ...current.filter((item) => item.id !== id)].slice(0, 4));
    return id;
  }, []);

  const value = useMemo(() => ({ dismissToast, showToast }), [dismissToast, showToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      {portalTarget ? createPortal(<ToastViewport dismissToast={dismissToast} toasts={toasts} />, portalTarget) : null}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error('useToast must be used inside ToastProvider.');
  }

  return context;
}

function ToastViewport({ dismissToast, toasts }: { dismissToast: (id: string) => void; toasts: ToastRecord[] }) {
  return (
    <div
      aria-live="polite"
      aria-relevant="additions text"
      className="fixed bottom-4 right-4 z-[calc(var(--z-overlay)+20)] flex w-[min(360px,calc(100vw-2rem))] flex-col gap-3"
    >
      {toasts.map((toast) => (
        <ToastItem dismissToast={dismissToast} key={toast.id} toast={toast} />
      ))}
    </div>
  );
}

function ToastItem({ dismissToast, toast }: { dismissToast: (id: string) => void; toast: ToastRecord }) {
  useEffect(() => {
    if (toast.duration === 0) {
      return;
    }

    const timeout = window.setTimeout(() => dismissToast(toast.id), toast.duration ?? 5000);
    return () => window.clearTimeout(timeout);
  }, [dismissToast, toast.duration, toast.id]);

  const assertive = toast.tone === 'error' || toast.tone === 'warning';

  return (
    <div
      className="min-h-[78px] rounded-[12px] border border-[#d8c7b8] bg-[#fffcf8] p-4 text-[#1e1a16] shadow-none"
      data-tone={toast.tone}
      role={assertive ? 'alert' : 'status'}
    >
      <div className="flex items-start gap-3">
        <span aria-hidden="true" className={cn('mt-1 h-2.5 w-2.5 shrink-0 rounded-full', toastToneMarkerClassNames[toast.tone])} />
        <div className="min-w-0 flex-1">
          <p className="text-base font-semibold leading-[22px]">{toast.title}</p>
          {toast.description ? <div className="mt-1 text-[13px] leading-[18px] text-[#6b625a]">{toast.description}</div> : null}
        </div>
        <button
          aria-label="Закрыть уведомление"
          className="inline-flex min-h-8 min-w-8 shrink-0 items-center justify-center rounded-[var(--radius-sm)] text-lg leading-none opacity-70 transition-opacity duration-[var(--motion-duration-fast)] ease-[var(--motion-ease-standard)] hover:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] motion-reduce:transition-none"
          onClick={() => dismissToast(toast.id)}
          type="button"
        >
          <span aria-hidden="true">&times;</span>
        </button>
      </div>
    </div>
  );
}
