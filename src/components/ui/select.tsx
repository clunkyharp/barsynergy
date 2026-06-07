'use client';

import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type FocusEvent,
  type FormEvent,
  type KeyboardEvent
} from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { extractOptions, SELECT_OPEN_EVENT, type SelectProps } from './select-utils';
import { useSelectPosition } from './select-position';
import { SelectMenu } from './select-menu';

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

  const menuStyle = useSelectPosition(open, activeIndex, options.length, buttonRef, menuRef);

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

    onChange?.({
      currentTarget: { value: nextValue },
      target: { value: nextValue }
    } as React.ChangeEvent<HTMLSelectElement>);
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
        <span className="min-w-0 flex-1 truncate" data-placeholder={!selectedValue || undefined}>
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
      <SelectMenu
        open={open}
        menuStyle={menuStyle}
        listboxId={listboxId}
        options={options}
        selectedValue={selectedValue}
        baseId={baseId}
        activeIndex={activeIndex}
        portalTarget={portalTarget}
        menuRef={menuRef}
        onSelect={selectValue}
        onActiveIndexChange={setActiveIndex}
      />
    </div>
  );
}
