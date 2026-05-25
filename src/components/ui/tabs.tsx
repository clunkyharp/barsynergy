'use client';

import { useId, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

type TabItem<T extends string> = {
  content: ReactNode;
  disabled?: boolean;
  label: ReactNode;
  value: T;
};

type TabsProps<T extends string> = {
  className?: string;
  items: TabItem<T>[];
  onValueChange: (value: T) => void;
  tabListClassName?: string;
  value: T;
};

export function Tabs<T extends string>({ className, items, onValueChange, tabListClassName, value }: TabsProps<T>) {
  const baseId = useId();
  const activeItem = items.find((item) => item.value === value && !item.disabled) ?? items.find((item) => !item.disabled);

  return (
    <div className={className}>
      <div
        className={cn(
          'inline-flex max-w-full gap-1 overflow-x-auto rounded-[var(--radius-md)] border border-[var(--line)] bg-[var(--surface-muted)] p-1',
          tabListClassName
        )}
        role="tablist"
      >
        {items.map((item) => {
          const selected = activeItem?.value === item.value;
          const tabId = `${baseId}-${item.value}-tab`;
          const panelId = `${baseId}-${item.value}-panel`;

          return (
            <button
              aria-controls={panelId}
              aria-disabled={item.disabled || undefined}
              aria-selected={selected}
              className={cn(
                'inline-flex min-h-10 shrink-0 items-center justify-center rounded-[var(--radius-sm)] px-4 text-sm font-semibold transition-[background-color,color,box-shadow] duration-[var(--motion-duration-fast)] ease-[var(--motion-ease-standard)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] motion-reduce:transition-none',
                selected
                  ? 'bg-[var(--surface)] text-[var(--text)] shadow-[var(--shadow-card)]'
                  : 'text-[var(--muted)] hover:bg-[var(--surface)] hover:text-[var(--text)]',
                item.disabled && 'cursor-not-allowed opacity-50 hover:bg-transparent hover:text-[var(--muted)]'
              )}
              disabled={item.disabled}
              id={tabId}
              key={item.value}
              onClick={() => onValueChange(item.value)}
              role="tab"
              tabIndex={selected ? 0 : -1}
              type="button"
            >
              {item.label}
            </button>
          );
        })}
      </div>
      {items.map((item) => {
        const selected = activeItem?.value === item.value;

        return (
          <div
            aria-labelledby={`${baseId}-${item.value}-tab`}
            hidden={!selected}
            id={`${baseId}-${item.value}-panel`}
            key={item.value}
            role="tabpanel"
            tabIndex={0}
          >
            {selected ? item.content : null}
          </div>
        );
      })}
    </div>
  );
}
