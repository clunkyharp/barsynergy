'use client';

import { useCallback, useEffect, useLayoutEffect, useState, type CSSProperties } from 'react';
import { getOverlayPosition } from '@/lib/ui/overlay-position';
import { SELECT_MENU_MAX_HEIGHT } from './select-utils';

export function useSelectPosition(
  open: boolean,
  activeIndex: number,
  optionsLength: number,
  buttonRef: { current: HTMLButtonElement | null },
  menuRef: { current: HTMLDivElement | null },
): CSSProperties | null {
  const [menuStyle, setMenuStyle] = useState<CSSProperties | null>(null);

  const updateMenuPosition = useCallback(() => {
    if (!buttonRef.current || !menuRef.current) {
      return;
    }

    const triggerRect = buttonRef.current.getBoundingClientRect();
    const overlayRect = {
      height: Math.min(menuRef.current.scrollHeight, SELECT_MENU_MAX_HEIGHT),
      width: Math.max(menuRef.current.offsetWidth, triggerRect.width)
    };
    const position = getOverlayPosition({
      align: 'start',
      matchTriggerWidth: true,
      maxHeight: SELECT_MENU_MAX_HEIGHT,
      overlayRect,
      sideOffset: 8,
      triggerRect,
      viewportHeight: window.innerHeight,
      viewportPadding: 12,
      viewportWidth: window.innerWidth
    });

    setMenuStyle({
      left: position.left,
      maxHeight: position.maxHeight,
      position: 'fixed',
      top: position.top,
      transformOrigin: position.transformOrigin,
      width: position.width
    });
  }, [buttonRef, menuRef]);

  useLayoutEffect(() => {
    if (!open) {
      return;
    }

    updateMenuPosition();
  }, [activeIndex, open, optionsLength, updateMenuPosition]);

  useEffect(() => {
    if (!open) {
      return;
    }

    function handleViewportChange() {
      updateMenuPosition();
    }

    window.addEventListener('resize', handleViewportChange);
    window.addEventListener('scroll', handleViewportChange, true);

    return () => {
      window.removeEventListener('resize', handleViewportChange);
      window.removeEventListener('scroll', handleViewportChange, true);
    };
  }, [open, updateMenuPosition]);

  return menuStyle;
}
