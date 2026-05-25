'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ButtonHTMLAttributes,
  type CSSProperties,
  type HTMLAttributes
} from 'react';
import { createPortal } from 'react-dom';
import { focusFirstElement } from '@/components/ui/focus-trap';
import { getOverlayPosition } from '@/lib/ui/overlay-position';
import { cn } from '@/lib/utils';

const DEFAULT_DROPDOWN_OPEN_EVENT = 'barsynergy-dropdown-menu-open';
const DEFAULT_DROPDOWN_MAX_HEIGHT = 320;

type DropdownMenuContextValue = {
  align: 'start' | 'end';
  closeMenu: (options?: { restoreFocus?: boolean }) => void;
  contentRef: React.RefObject<HTMLDivElement | null>;
  contentStyle: CSSProperties | null;
  eventName: string;
  focusSelector: string;
  id: string;
  maxHeight: number;
  minWidth: number;
  open: boolean;
  portalTarget: HTMLElement | null;
  rootRef: React.RefObject<HTMLDivElement | null>;
  setOpen: (open: boolean) => void;
  triggerRef: React.RefObject<HTMLButtonElement | null>;
  updatePosition: () => void;
};

type DropdownMenuProps = HTMLAttributes<HTMLDivElement> & {
  align?: 'start' | 'end';
  closeIgnoreSelector?: string;
  eventName?: string;
  focusSelector?: string;
  maxHeight?: number;
  minWidth?: number;
  sideOffset?: number;
};

type DropdownMenuTriggerProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  label?: string;
};

const DropdownMenuContext = createContext<DropdownMenuContextValue | null>(null);

export function useDropdownMenu() {
  const context = useContext(DropdownMenuContext);

  if (!context) {
    throw new Error('DropdownMenu components must be used inside DropdownMenu.');
  }

  return context;
}

export function DropdownMenu({
  align = 'end',
  children,
  className,
  closeIgnoreSelector,
  eventName = DEFAULT_DROPDOWN_OPEN_EVENT,
  focusSelector = '[role="menuitem"]',
  maxHeight = DEFAULT_DROPDOWN_MAX_HEIGHT,
  minWidth = 208,
  sideOffset = 8,
  ...props
}: DropdownMenuProps) {
  const id = useId();
  const [open, setOpen] = useState(false);
  const [portalTarget, setPortalTarget] = useState<HTMLElement | null>(null);
  const [contentStyle, setContentStyle] = useState<CSSProperties | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setPortalTarget(document.body);
  }, []);

  const updatePosition = useCallback(() => {
    if (!triggerRef.current || !contentRef.current) {
      return;
    }

    const triggerRect = triggerRef.current.getBoundingClientRect();
    const overlayRect = {
      height: Math.min(contentRef.current.scrollHeight, maxHeight),
      width: Math.max(contentRef.current.offsetWidth, minWidth)
    };
    const position = getOverlayPosition({
      align,
      maxHeight,
      minWidth,
      overlayRect,
      sideOffset,
      triggerRect,
      viewportHeight: window.innerHeight,
      viewportPadding: 12,
      viewportWidth: window.innerWidth
    });

    setContentStyle({
      left: position.left,
      maxHeight: position.maxHeight,
      position: 'fixed',
      top: position.top,
      transformOrigin: position.transformOrigin
    });
  }, [align, maxHeight, minWidth, sideOffset]);

  const closeMenu = useCallback((options?: { restoreFocus?: boolean }) => {
    setOpen(false);
    setContentStyle(null);

    if (options?.restoreFocus) {
      triggerRef.current?.focus();
    }
  }, []);

  useEffect(() => {
    if (!open) {
      setContentStyle(null);
      return;
    }

    document.dispatchEvent(new CustomEvent<string>(eventName, { detail: id }));

    function handleOpen(event: Event) {
      if ((event as CustomEvent<string>).detail !== id) {
        closeMenu();
      }
    }

    function handlePointerDown(event: MouseEvent) {
      const target = event.target;

      if (!(target instanceof Element)) {
        return;
      }

      if (rootRef.current?.contains(target) || contentRef.current?.contains(target) || (closeIgnoreSelector && target.closest(closeIgnoreSelector))) {
        return;
      }

      closeMenu();
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        event.preventDefault();
        closeMenu({ restoreFocus: true });
      }
    }

    function handleViewportChange() {
      updatePosition();
    }

    document.addEventListener(eventName, handleOpen);
    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    window.addEventListener('resize', handleViewportChange);
    window.addEventListener('scroll', handleViewportChange, true);

    return () => {
      document.removeEventListener(eventName, handleOpen);
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('resize', handleViewportChange);
      window.removeEventListener('scroll', handleViewportChange, true);
    };
  }, [closeIgnoreSelector, closeMenu, eventName, id, open, updatePosition]);

  useLayoutEffect(() => {
    if (open) {
      updatePosition();
    }
  }, [open, updatePosition]);

  const context = useMemo<DropdownMenuContextValue>(
    () => ({
      align,
      closeMenu,
      contentRef,
      contentStyle,
      eventName,
      focusSelector,
      id,
      maxHeight,
      minWidth,
      open,
      portalTarget,
      rootRef,
      setOpen,
      triggerRef,
      updatePosition
    }),
    [align, closeMenu, contentStyle, eventName, focusSelector, id, maxHeight, minWidth, open, portalTarget, updatePosition]
  );

  return (
    <div className={cn('relative inline-flex', className)} ref={rootRef} {...props}>
      <DropdownMenuContext.Provider value={context}>{children}</DropdownMenuContext.Provider>
    </div>
  );
}

export function DropdownMenuTrigger({ children = '⋯', className, label = 'Открыть меню', onClick, onKeyDown, ...props }: DropdownMenuTriggerProps) {
  const { id, open, setOpen, triggerRef } = useDropdownMenu();
  const contentId = `${id}-content`;

  return (
    <button
      aria-controls={contentId}
      aria-expanded={open}
      aria-haspopup="menu"
      className={className}
      onClick={(event) => {
        onClick?.(event);

        if (!event.defaultPrevented) {
          setOpen(!open);
        }
      }}
      onKeyDown={(event) => {
        onKeyDown?.(event);

        if (event.defaultPrevented) {
          return;
        }

        if (event.key === 'ArrowDown' || event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          setOpen(true);
        }
      }}
      ref={triggerRef}
      type="button"
      {...props}
    >
      <span aria-hidden="true">{children}</span>
      <span className="sr-only">{label}</span>
    </button>
  );
}

export function DropdownMenuContent({ children, className, style, ...props }: HTMLAttributes<HTMLDivElement>) {
  const { contentRef, contentStyle, focusSelector, id, open, portalTarget, updatePosition } = useDropdownMenu();

  useLayoutEffect(() => {
    if (open) {
      updatePosition();
    }
  }, [children, open, updatePosition]);

  useEffect(() => {
    if (open && contentStyle) {
      const focusMenuItem = () => {
        const firstMenuItem = contentRef.current?.querySelector<HTMLElement>(focusSelector);

        if (firstMenuItem) {
          firstMenuItem.focus({ preventScroll: true });
          return;
        }

        focusFirstElement(contentRef.current);
      };
      const focusFrame = window.requestAnimationFrame(focusMenuItem);
      const focusTimer = window.setTimeout(focusMenuItem, 120);

      return () => {
        window.cancelAnimationFrame(focusFrame);
        window.clearTimeout(focusTimer);
      };
    }

    return undefined;
  }, [contentRef, contentStyle, focusSelector, open]);

  if (!open || !portalTarget) {
    return null;
  }

  return createPortal(
    <div
      id={`${id}-content`}
      ref={contentRef}
      role="menu"
      style={{ ...contentStyle, ...style, visibility: contentStyle ? 'visible' : 'hidden', zIndex: 'var(--z-overlay)' }}
      className={cn('dropdown-menu-content motion-reduce:transition-none', className)}
      {...props}
    >
      {children}
    </div>,
    portalTarget
  );
}
