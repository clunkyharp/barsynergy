'use client';

import type { ChangeEvent } from 'react';
import { RotateCcw, X } from 'lucide-react';
import { SearchInput } from '@/components/ui/search-input';
import { Select } from '@/components/ui/select';
import { MultiSelect } from '@/components/ui/multi-select';
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
    displayValue?: string;
  };
  onClear: (name: string, value?: string) => void;
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
  onClear: (name: string, value?: string) => void;
  options: SelectOption[];
  wrapperClassName: string;
};

type MultiSelectFieldProps = {
  activeValues: string[];
  allLabel: string;
  ariaLabel: string;
  controlClassName: string;
  fieldLabelClassName: string;
  id: string;
  label: string;
  name: string;
  onChange: (values: string[]) => void;
  onClear: (name: string, value?: string) => void;
  options: SelectOption[];
  wrapperClassName: string;
};

export function PublicFiltersActiveChip({
  className,
  filter,
  onClear
}: ActiveFilterChipProps) {
  const shown = filter.displayValue ?? filter.value;
  return (
    <button
      aria-label={`Убрать фильтр: ${filter.label} ${shown}`}
      className={className}
      onClick={() => onClear(filter.name, filter.value)}
      type="button"
    >
      <span className="min-w-0 break-words">
        <span className="text-[var(--muted)]">{filter.label}:&nbsp;</span>
        <span className="text-[var(--text)]">{shown}</span>
      </span>
      <X size={12} strokeWidth={1.8} className="shrink-0 text-white/30 transition-colors group-hover:text-white/70" />
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
          className="inline-flex min-h-9 items-center gap-1.5 justify-self-start rounded-[var(--radius-sm)] border border-[var(--border-default)] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[var(--tracking-marker)] text-[var(--muted)] transition-colors hover:border-[var(--accent)]/35 hover:text-[var(--text)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)] motion-reduce:transition-none"
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

export function PublicFiltersMultiSelectField({
  activeValues,
  allLabel: _allLabel,
  ariaLabel,
  controlClassName,
  fieldLabelClassName,
  id,
  label,
  name: _name,
  onChange,
  onClear,
  options,
  wrapperClassName
}: MultiSelectFieldProps) {
  return (
    <div className={wrapperClassName}>
      <label className={fieldLabelClassName} htmlFor={id}>
        {label}
      </label>
      <MultiSelect
        aria-label={ariaLabel}
        className={controlClassName}
        id={id}
        label={label}
        options={options}
        placeholder="Выберите значения"
        selectedValues={activeValues}
        onChange={onChange}
        maxVisibleChips={2}
      />
      {activeValues.length > 0 ? (
        <button
          aria-label={`Сбросить фильтр: ${label}`}
          className="inline-flex min-h-9 items-center gap-1.5 justify-self-start rounded-[var(--radius-sm)] border border-[var(--border-default)] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[var(--tracking-marker)] text-[var(--muted)] transition-colors hover:border-[var(--accent)]/35 hover:text-[var(--text)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)] motion-reduce:transition-none"
          onClick={() => onClear(_name)}
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
        'inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[var(--tracking-eyebrow-md)] text-[var(--accent)] transition-colors duration-[var(--motion-duration-fast)] ease-[var(--motion-ease-standard)] hover:text-[var(--accent-strong)] motion-reduce:transition-none',
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
