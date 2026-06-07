import { Children, isValidElement, type ChangeEvent, type ReactElement, type ReactNode, type SelectHTMLAttributes } from 'react';

type OptionElementProps = {
  children?: ReactNode;
  disabled?: boolean;
  value?: string | number;
};

export type SelectOption = {
  disabled: boolean;
  label: string;
  value: string;
};

export type SelectProps = Omit<SelectHTMLAttributes<HTMLSelectElement>, 'children' | 'size' | 'multiple'> & {
  children: ReactNode;
  'data-state'?: string;
};

export const SELECT_OPEN_EVENT = 'barsynergy-select-open';
export const SELECT_MENU_MAX_HEIGHT = 320;

function optionLabel(children: ReactNode) {
  return Children.toArray(children)
    .map((child) => (typeof child === 'string' || typeof child === 'number' ? String(child) : ''))
    .join('')
    .trim();
}

export function extractOptions(children: ReactNode): SelectOption[] {
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

export function buildSyntheticChange(value: string) {
  return {
    currentTarget: { value },
    target: { value }
  } as ChangeEvent<HTMLSelectElement>;
}
