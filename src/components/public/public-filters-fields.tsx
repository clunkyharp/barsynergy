'use client';

import type { ChangeEvent } from 'react';
import { RotateCcw, X } from 'lucide-react';
import { SearchInput } from '@/components/ui/search-input';
import { Select } from '@/components/ui/select';
import { cn } from '@/lib/utils';

type SelectOption = {
  label: string;
  value: string;
};

type ActiveFilterChipProps = {
  className: string;
  filter: {
    label: string;
    name: string;
    value: string;
  };
  onClear: (name: string) => void;
};

type SearchFieldProps = {
  controlClassName: string;
  fieldLabelClassName: string;
  id: string;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  placeholder: string;
  shouldShowLabel: boolean;
  wrapperClassName: string;
  value: string;
};

type SelectFieldProps = {
  activeValue: string;
  allLabel: string;
  ariaLabel: string;
  controlClassName: string;
  fieldLabelClassName: string;
  id: string;
  label: string;
  name: string;
  onChange: (event: ChangeEvent<HTMLSelectElement>) => void;
  onClear: (name: string) => void;
  options: SelectOption[];
  wrapperClassName: string;
};

export function PublicFiltersActiveChip({
  className,
  filter,
  onClear
}: ActiveFilterChipProps) {
  return (
    <button
      aria-label={`Убрать фильтр: ${filter.label} ${filter.value}`}
      className={className}
      onClick={() => onClear(filter.name)}
      type="button"
    >
      <span className="font-semibold uppercase tracking-[0.12em]">{filter.label}</span>
      <span className="break-words text-[var(--text)]">{filter.value}</span>
      <X size={12} strokeWidth={1.8} />
    </button>
  );
}

export function PublicFiltersSearchField({
  controlClassName,
  fieldLabelClassName,
  id,
  onChange,
  placeholder,
  shouldShowLabel,
  wrapperClassName,
  value
}: SearchFieldProps) {
  return (
    <div className={wrapperClassName}>
      <label className={shouldShowLabel ? fieldLabelClassName : 'sr-only'} htmlFor={id}>
        Поиск по списку
      </label>
      <SearchInput
        aria-label="Поиск по списку"
        autoComplete="off"
        className={controlClassName}
        enterKeyHint="search"
        id={id}
        inputMode="search"
        name="q"
        onChange={onChange}
        placeholder={placeholder}
        spellCheck={false}
        type="search"
        value={value}
      />
    </div>
  );
}

export function PublicFiltersSelectField({
  activeValue,
  allLabel,
  ariaLabel,
  controlClassName,
  fieldLabelClassName,
  id,
  label,
  name,
  onChange,
  onClear,
  options,
  wrapperClassName
}: SelectFieldProps) {
  return (
    <div className={wrapperClassName}>
      <label className={fieldLabelClassName} htmlFor={id}>
        {label}
      </label>
      <Select
        aria-label={ariaLabel}
        className={controlClassName}
        id={id}
        name={name}
        onChange={onChange}
        value={activeValue}
      >
        <option value="">{allLabel}</option>
        {options.map((option) => (
          <option key={`${name}-${option.value}`} value={option.value}>
            {option.label}
          </option>
        ))}
      </Select>
      {activeValue ? (
        <button
          aria-label={`Сбросить фильтр: ${label}`}
          className="inline-flex min-h-9 items-center gap-1.5 justify-self-start rounded-[var(--radius-sm)] border border-[var(--border-default)] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--muted)] transition-colors hover:border-[var(--accent)]/35 hover:text-[var(--text)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)] motion-reduce:transition-none"
          onClick={() => onClear(name)}
          type="button"
        >
          <X aria-hidden="true" size={12} />
          Сбросить
        </button>
      ) : null}
    </div>
  );
}

export function PublicFiltersResetButton({
  className,
  onClick
}: {
  className?: string;
  onClick: () => void;
}) {
  return (
    <button
      className={cn(
        'inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--accent)] transition-colors duration-[var(--motion-duration-fast)] ease-[var(--motion-ease-standard)] hover:text-[var(--accent-strong)] motion-reduce:transition-none',
        className
      )}
      onClick={onClick}
      type="button"
    >
      <RotateCcw size={14} strokeWidth={1.8} />
      Сбросить
    </button>
  );
}
