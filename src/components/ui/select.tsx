'use client';

import {
  Children,
  isValidElement,
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ChangeEvent,
  type FocusEvent,
  type FormEvent,
  type KeyboardEvent,
  type ReactElement,
  type ReactNode,
  type SelectHTMLAttributes
} from 'react';
import { createPortal } from 'react-dom';
import { Check, ChevronDown } from 'lucide-react';
import { getOverlayPosition } from '@/lib/ui/overlay-position';
import { cn } from '@/lib/utils';

type OptionElementProps = {
  children?: ReactNode;
  disabled?: boolean;
  value?: string | number;
};

type SelectOption = {
  disabled: boolean;
  label: string;
  value: string;
};

type SelectProps = Omit<SelectHTMLAttributes<HTMLSelectElement>, 'children' | 'size' | 'multiple'> & {
  children: ReactNode;
  'data-state'?: string;
};

const SELECT_OPEN_EVENT = 'barsynergy-select-open';
const SELECT_MENU_MAX_HEIGHT = 320;

function optionLabel(children: ReactNode) {
  return Children.toArray(children)
    .map((child) => (typeof child === 'string' || typeof child === 'number' ? String(child) : ''))
    .join('')
    .trim();
}

function extractOptions(children: ReactNode): SelectOption[] {
  return Children.toArray(children).flatMap((child) => {
    if (!isValidElement(child)) {
      return [];
    }

    const element = child as ReactElement<OptionElementProps>;

    if (element.type !== 'option') {
      return [];
    }

    const label = optionLabel(element.props.children);

    return [
      {
        disabled: Boolean(element.props.disabled),
        label,
        value: String(element.props.value ?? label)
      }
    ];
  });
}

function buildSyntheticChange(value: string) {
  return {
    currentTarget: { value },
    target: { value }
  } as ChangeEvent<HTMLSelectElement>;
}

export function Select({
  'aria-describedby': ariaDescribedBy,
  'aria-invalid': ariaInvalid,
  'aria-label': ariaLabel,
  className,
  'data-state': dataState,
  defaultValue,
  disabled,
  form,
  id,
  name,
  onBlur,
  onChange,
  onInvalid,
  onClick: _onClick,
  onFocus,
  onKeyDown: _onKeyDown,
  required,
  value,
  children,
  autoFocus,
  tabIndex,
  title
}: SelectProps) {
  const options = useMemo(() => extractOptions(children), [children]);
  const fallbackValue = options[0]?.value ?? '';
  const [internalValue, setInternalValue] = useState(String(defaultValue ?? fallbackValue));
  const selectedValue = String(value ?? internalValue);
  const selectedOption = options.find((option) => option.value === selectedValue) ?? options[0];
  const selectedIndex = Math.max(0, options.findIndex((option) => option.value === selectedOption?.value));
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(selectedIndex);
  const [nativeInvalid, setNativeInvalid] = useState(false);
  const [typed, setTyped] = useState('');
  const [portalTarget, setPortalTarget] = useState<HTMLElement | null>(null);
  const [menuStyle, setMenuStyle] = useState<CSSProperties | null>(null);
  const selectInstanceId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const baseId = id ?? selectInstanceId;
  const triggerId = id ?? `${baseId}-trigger`;
  const listboxId = `${baseId}-listbox`;
  const activeOptionId = `${baseId}-option-${activeIndex}`;
  const isFilled = selectedValue.length > 0;
  const triggerState = nativeInvalid ? 'error' : dataState;
  const triggerAriaInvalid = nativeInvalid ? true : ariaInvalid;

  useEffect(() => {
    setPortalTarget(document.body);
  }, []);

  useEffect(() => {
    setActiveIndex(selectedIndex);
  }, [selectedIndex]);

  useEffect(() => {
    if (!required || selectedValue) {
      setNativeInvalid(false);
    }
  }, [required, selectedValue]);

  useEffect(() => {
    if (disabled && open) {
      setOpen(false);
    }
  }, [disabled, open]);

  useEffect(() => {
    function handleSelectOpen(event: Event) {
      if ((event as CustomEvent<string>).detail !== selectInstanceId) {
        setOpen(false);
      }
    }

    document.addEventListener(SELECT_OPEN_EVENT, handleSelectOpen);
    return () => document.removeEventListener(SELECT_OPEN_EVENT, handleSelectOpen);
  }, [selectInstanceId]);

  useEffect(() => {
    if (!open) {
      setMenuStyle(null);
      return;
    }

    function handlePointerDown(event: MouseEvent) {
      const target = event.target;

      if (!(target instanceof Element)) {
        return;
      }

      if (rootRef.current?.contains(target) || menuRef.current?.contains(target)) {
        return;
      }

      setOpen(false);
    }

    document.addEventListener('mousedown', handlePointerDown);
    return () => document.removeEventListener('mousedown', handlePointerDown);
  }, [open]);

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
  }, []);

  useLayoutEffect(() => {
    if (!open) {
      return;
    }

    updateMenuPosition();
  }, [activeIndex, open, options.length, updateMenuPosition]);

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

  useEffect(() => {
    if (!typed) {
      return;
    }

    const timerId = window.setTimeout(() => setTyped(''), 500);
    return () => window.clearTimeout(timerId);
  }, [typed]);

  function selectValue(nextValue: string, selectionOptions: { focusButton?: boolean } = {}) {
    const nextOption = options.find((option) => option.value === nextValue);

    if (!nextOption || nextOption.disabled || disabled) {
      return;
    }

    if (value === undefined) {
      setInternalValue(nextValue);
    }

    onChange?.(buildSyntheticChange(nextValue));
    setNativeInvalid(false);
    setOpen(false);

    if (selectionOptions.focusButton ?? true) {
      buttonRef.current?.focus();
    }
  }

  function openSelect() {
    if (disabled || options.length === 0) {
      return;
    }

    document.dispatchEvent(new CustomEvent<string>(SELECT_OPEN_EVENT, { detail: selectInstanceId }));
    setOpen(true);
  }

  function toggleOpen() {
    if (open) {
      setOpen(false);
      return;
    }

    openSelect();
  }

  function handleNativeInvalid(event: FormEvent<HTMLSelectElement>) {
    onInvalid?.(event);

    if (!event.defaultPrevented) {
      event.preventDefault();
    }

    setNativeInvalid(true);
    setOpen(false);
    buttonRef.current?.focus();
  }

  function moveActive(direction: 1 | -1) {
    if (options.length === 0) {
      return;
    }

    let nextIndex = activeIndex;

    for (let step = 0; step < options.length; step += 1) {
      nextIndex = (nextIndex + direction + options.length) % options.length;

      if (!options[nextIndex]?.disabled) {
        setActiveIndex(nextIndex);
        return;
      }
    }
  }

  function activateByTypeahead(key: string) {
    const nextTyped = `${typed}${key}`.toLowerCase();
    setTyped(nextTyped);
    const matchedIndex = options.findIndex((option) => !option.disabled && option.label.toLowerCase().startsWith(nextTyped));

    if (matchedIndex >= 0) {
      setActiveIndex(matchedIndex);
      openSelect();
    }
  }

  function handleKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    if (event.key === 'Tab') {
      setOpen(false);
      return;
    }

    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      openSelect();
      moveActive(event.key === 'ArrowDown' ? 1 : -1);
      return;
    }

    if (event.key === 'Home') {
      event.preventDefault();
      const firstIndex = options.findIndex((option) => !option.disabled);
      if (firstIndex >= 0) {
        openSelect();
        setActiveIndex(firstIndex);
      }
      return;
    }

    if (event.key === 'End') {
      event.preventDefault();
      let lastIndex = -1;
      for (let index = options.length - 1; index >= 0; index -= 1) {
        if (!options[index]?.disabled) {
          lastIndex = index;
          break;
        }
      }
      if (lastIndex >= 0) {
        openSelect();
        setActiveIndex(lastIndex);
      }
      return;
    }

    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();

      if (open) {
        selectValue(options[activeIndex]?.value ?? selectedValue);
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

    if (event.key.length === 1 && !event.metaKey && !event.ctrlKey && !event.altKey) {
      activateByTypeahead(event.key);
    }
  }

  function handleRootBlur(event: FocusEvent<HTMLDivElement>) {
    const nextTarget = event.relatedTarget;

    if (nextTarget instanceof Element && (nextTarget.closest('.custom-select') || menuRef.current?.contains(nextTarget))) {
      return;
    }

    if (!nextTarget || !event.currentTarget.contains(nextTarget as Node)) {
      setOpen(false);
    }
  }

  const menu = open ? (
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
          onClick={() => selectValue(option.value)}
          onMouseEnter={() => setActiveIndex(index)}
          role="option"
          type="button"
        >
          <span className="min-w-0 flex-1">{option.label}</span>
          {option.value === selectedValue ? <Check aria-hidden className="custom-select-option-check" size={14} strokeWidth={2} /> : null}
        </button>
      ))}
    </div>
  ) : null;

  return (
    <div className="custom-select" onBlur={handleRootBlur} ref={rootRef}>
      <button
        aria-activedescendant={open ? activeOptionId : undefined}
        aria-controls={listboxId}
        aria-describedby={ariaDescribedBy}
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-invalid={triggerAriaInvalid}
        aria-label={ariaLabel}
        aria-required={required || undefined}
        className={cn('field-base custom-select-trigger px-4 py-3 text-left text-[15px] leading-6', className)}
        data-filled={isFilled || undefined}
        data-state={triggerState}
        disabled={disabled}
        id={triggerId}
        onBlur={onBlur as never}
        onClick={toggleOpen}
        onFocus={onFocus as never}
        onKeyDown={handleKeyDown}
        ref={buttonRef}
        role="combobox"
        autoFocus={autoFocus}
        tabIndex={tabIndex}
        title={title}
        type="button"
      >
        <span className={cn('min-w-0 flex-1 truncate', !selectedValue && 'text-[var(--field-placeholder)]')}>
          {selectedOption?.label ?? 'Выберите значение'}
        </span>
        <ChevronDown aria-hidden className={cn('custom-select-chevron', open && 'rotate-180')} size={17} strokeWidth={1.8} />
      </button>
      <select
        aria-hidden="true"
        className="custom-select-native"
        disabled={disabled}
        form={form}
        name={name}
        onChange={(event) => selectValue(event.target.value, { focusButton: false })}
        onInvalid={handleNativeInvalid}
        required={required}
        tabIndex={-1}
        value={selectedValue}
      >
        {children}
      </select>
      {portalTarget && menu ? createPortal(menu, portalTarget) : null}
    </div>
  );
}
