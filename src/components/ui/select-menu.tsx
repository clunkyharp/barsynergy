'use client';

import { createPortal } from 'react-dom';
import { Check } from 'lucide-react';
import type { CSSProperties } from 'react';
import type { SelectOption } from './select-utils';

type SelectMenuProps = {
  open: boolean;
  menuStyle: CSSProperties | null;
  listboxId: string;
  options: SelectOption[];
  selectedValue: string;
  baseId: string;
  activeIndex: number;
  portalTarget: HTMLElement | null;
  menuRef: { current: HTMLDivElement | null };
  onSelect: (value: string) => void;
  onActiveIndexChange: (index: number) => void;
};

export function SelectMenu({
  open,
  menuStyle,
  listboxId,
  options,
  selectedValue,
  baseId,
  activeIndex,
  portalTarget,
  menuRef,
  onSelect,
  onActiveIndexChange
}: SelectMenuProps) {
  if (!open || !portalTarget) {
    return null;
  }

  return createPortal(
    <div
      className="custom-select-menu"
      id={listboxId}
      ref={menuRef}
      role="listbox"
      style={{ ...menuStyle, visibility: menuStyle ? 'visible' : 'hidden' }}
    >
      {options.map((option, index) => (
        <button
          aria-disabled={option.disabled || undefined}
          aria-selected={option.value === selectedValue}
          className="custom-select-option"
          data-active={index === activeIndex || undefined}
          data-selected={option.value === selectedValue || undefined}
          disabled={option.disabled}
          id={`${baseId}-option-${index}`}
          key={`${option.value}-${index}`}
          onClick={() => onSelect(option.value)}
          onMouseEnter={() => onActiveIndexChange(index)}
          role="option"
          type="button"
        >
          <span className="min-w-0 flex-1">{option.label}</span>
          {option.value === selectedValue ? <Check aria-hidden className="custom-select-option-check" size={14} strokeWidth={2} /> : null}
        </button>
      ))}
    </div>,
    portalTarget
  );
}
