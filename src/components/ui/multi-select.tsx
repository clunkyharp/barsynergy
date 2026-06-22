'use client';

import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type FocusEvent,
  type KeyboardEvent
} from 'react';
import { Check, ChevronDown, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSelectPosition } from '@/components/ui/select-position';
import { createPortal } from 'react-dom';

export type MultiSelectOption = {
  value: string;
  label: string;
};

type MultiSelectProps = {
  'aria-label'?: string;
  className?: string;
  disabled?: boolean;
  id?: string;
  label?: string;
  name?: string;
  options: MultiSelectOption[];
  placeholder?: string;
  selectedValues: string[];
  onChange: (values: string[]) => void;
  maxVisibleChips?: number;
};

const SELECT_OPEN_EVENT = 'barsynergy-select-open';

export function MultiSelect({
  'aria-label': ariaLabel,
  className,
  disabled,
  id,
  label,
  options,
  placeholder = 'Выберите значения',
  selectedValues,
  onChange,
  maxVisibleChips = 2
}: MultiSelectProps) {
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [portalTarget, setPortalTarget] = useState<HTMLElement | null>(null);
  const instanceId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const baseId = id ?? instanceId;
  const triggerId = id ?? `${baseId}-trigger`;
  const listboxId = `${baseId}-listbox`;

  const selectedSet = useMemo(() => new Set(selectedValues), [selectedValues]);
  const isFilled = selectedValues.length > 0;

  const displayChips = useMemo(() => {
    const selected = options.filter((o) => selectedSet.has(o.value));
    const visible = selected.slice(0, maxVisibleChips);
    const restCount = selected.length - visible.length;
    return { visible, restCount };
  }, [options, selectedSet, maxVisibleChips]);

  const menuStyle = useSelectPosition(open, activeIndex, options.length, buttonRef, menuRef);

  useEffect(() => {
    setPortalTarget(document.body);
  }, []);

  useEffect(() => {
    if (disabled && open) {
      setOpen(false);
    }
  }, [disabled, open]);

  useEffect(() => {
    if (!open) return;
    setActiveIndex(0);
  }, [open]);

  useEffect(() => {
    function handleSelectOpen(event: Event) {
      if ((event as CustomEvent<string>).detail !== instanceId) {
        setOpen(false);
      }
    }
    document.addEventListener(SELECT_OPEN_EVENT, handleSelectOpen);
    return () => document.removeEventListener(SELECT_OPEN_EVENT, handleSelectOpen);
  }, [instanceId]);

  useEffect(() => {
    if (!open) return;
    function handlePointerDown(event: MouseEvent) {
      const target = event.target;
      if (!(target instanceof Element)) return;
      if (rootRef.current?.contains(target) || menuRef.current?.contains(target)) return;
      setOpen(false);
    }
    document.addEventListener('mousedown', handlePointerDown);
    return () => document.removeEventListener('mousedown', handlePointerDown);
  }, [open]);

  function toggleValue(value: string) {
    const next = selectedSet.has(value)
      ? selectedValues.filter((v) => v !== value)
      : [...selectedValues, value];
    onChange(next);
  }

  function openSelect() {
    if (disabled || options.length === 0) return;
    document.dispatchEvent(new CustomEvent<string>(SELECT_OPEN_EVENT, { detail: instanceId }));
    setOpen(true);
  }

  function toggleOpen() {
    if (open) { setOpen(false); return; }
    openSelect();
  }

  function closeMenu() {
    setOpen(false);
    buttonRef.current?.focus();
  }

  function handleKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    if (event.key === 'Tab') { setOpen(false); return; }
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      if (!open) { openSelect(); return; }
      const dir = event.key === 'ArrowDown' ? 1 : -1;
      const nextIndex = (activeIndex + dir + options.length) % options.length;
      setActiveIndex(nextIndex);
      return;
    }
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      if (open) {
        const option = options[activeIndex];
        if (option) toggleValue(option.value);
      } else {
        openSelect();
      }
      return;
    }
    if (event.key === 'Escape') {
      event.preventDefault();
      setOpen(false);
      return;
    }
  }

  function handleRootBlur(event: FocusEvent<HTMLDivElement>) {
    const nextTarget = event.relatedTarget;
    if (nextTarget instanceof Element && menuRef.current?.contains(nextTarget)) return;
    if (!nextTarget || !event.currentTarget.contains(nextTarget as Node)) {
      setOpen(false);
    }
  }

  const removeValue = useCallback((value: string, e: React.MouseEvent | React.KeyboardEvent) => {
    e.stopPropagation();
    onChange(selectedValues.filter((v) => v !== value));
  }, [onChange, selectedValues]);

  return (
    <div className="custom-select" onBlur={handleRootBlur} ref={rootRef}>
      <button
        aria-activedescendant={open ? `${baseId}-option-${activeIndex}` : undefined}
        aria-controls={listboxId}
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-label={ariaLabel}
        className={cn(
          'field-base custom-select-trigger min-h-[44px] px-4 py-3 text-left text-[15px] leading-6',
          'h-auto flex-wrap gap-1',
          className
        )}
        data-filled={isFilled || undefined}
        disabled={disabled}
        id={triggerId}
        onClick={toggleOpen}
        onKeyDown={handleKeyDown}
        ref={buttonRef}
        role="combobox"
        type="button"
      >
        {isFilled ? (
          <span className="flex min-w-0 flex-1 flex-wrap items-center gap-1 overflow-hidden">
            {displayChips.visible.map((chip) => (
              <span
                key={chip.value}
                className="inline-flex items-center gap-1 rounded-[4px] bg-white/[0.06] px-2 py-0.5 text-[12px] font-medium leading-5 text-[var(--text)]"
              >
                {chip.label}
                <span
                  aria-label={`Удалить ${chip.label}`}
                  className="inline-flex cursor-pointer text-white/30 transition-colors hover:text-white/70"
                  onClick={(e) => removeValue(chip.value, e)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      removeValue(chip.value, e);
                    }
                  }}
                  role="button"
                  tabIndex={-1}
                >
                  <X size={12} strokeWidth={1.8} />
                </span>
              </span>
            ))}
            {displayChips.restCount > 0 ? (
              <span className="text-[12px] font-medium leading-5 text-[var(--muted)]">
                +{displayChips.restCount}
              </span>
            ) : null}
          </span>
        ) : (
          <span className="min-w-0 flex-1 text-[var(--muted)]">{placeholder}</span>
        )}
        <ChevronDown
          aria-hidden
          className={cn('custom-select-chevron shrink-0', open && 'rotate-180')}
          size={17}
          strokeWidth={1.8}
        />
      </button>
      <select
        aria-hidden="true"
        className="custom-select-native"
        disabled={disabled}
        multiple
        name={label ? `${label}-multi` : undefined}
        tabIndex={-1}
        value={selectedValues}
        onChange={() => {}}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value} />
        ))}
      </select>
      {open && portalTarget ? createPortal(
        <div
          className="custom-select-menu"
          id={listboxId}
          ref={menuRef}
          role="listbox"
          style={{
            ...menuStyle,
            visibility: menuStyle ? 'visible' : 'hidden',
            overflow: 'hidden',
            padding: 0,
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          <div className="flex-1 overflow-y-auto p-1.5" style={{ minHeight: 0, maxHeight: 240 }}>
            {options.map((option, index) => (
              <button
                aria-selected={selectedSet.has(option.value)}
                className={cn(
                  'custom-select-option',
                  selectedSet.has(option.value) && 'has-check'
                )}
                data-active={index === activeIndex || undefined}
                data-selected={selectedSet.has(option.value) || undefined}
                id={`${baseId}-option-${index}`}
                key={option.value}
                onClick={() => toggleValue(option.value)}
                onMouseEnter={() => setActiveIndex(index)}
                role="option"
                type="button"
              >
                <span className="custom-select-option-checkbox" aria-hidden>
                  {selectedSet.has(option.value) ? (
                    <Check size={12} strokeWidth={2.5} />
                  ) : null}
                </span>
                <span className="min-w-0 flex-1">{option.label}</span>
              </button>
            ))}
          </div>
          <div className="flex shrink-0 justify-end border-t border-[var(--line)] px-3 py-2">
            <button
              className="rounded-[var(--radius-sm)] border border-[var(--border-default)] px-3 py-1.5 text-[11px] font-medium text-[var(--muted)] transition-colors hover:border-[var(--accent)]/40 hover:text-[var(--text)]"
              onClick={closeMenu}
              type="button"
            >
              Готово
            </button>
          </div>
        </div>,
        portalTarget
      ) : null}
    </div>
  );
}
