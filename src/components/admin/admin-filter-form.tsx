'use client';

import { useTransition, type FormHTMLAttributes } from 'react';
import { useRouter } from 'next/navigation';

type AdminFilterFormProps = Omit<FormHTMLAttributes<HTMLFormElement>, 'action' | 'method'> & {
  action: string;
};
type AdminFilterSubmitEvent = Parameters<NonNullable<FormHTMLAttributes<HTMLFormElement>['onSubmit']>>[0];

export function AdminFilterForm({ action, onSubmit, ...props }: AdminFilterFormProps) {
  const router = useRouter();
  const [, startTransition] = useTransition();

  function handleSubmit(event: AdminFilterSubmitEvent) {
    onSubmit?.(event);

    if (event.defaultPrevented) {
      return;
    }

    event.preventDefault();

    const form = event.currentTarget;
    const target = new URL(action, window.location.origin);
    const nextParams = new URLSearchParams(target.search);
    const formData = new FormData(form);
    const fieldNames = new Set<string>();

    formData.forEach((_, name) => {
      fieldNames.add(name);
    });

    fieldNames.forEach((name) => {
      nextParams.delete(name);
    });

    nextParams.delete('error');
    nextParams.delete('page');
    nextParams.delete('success');

    formData.forEach((value, name) => {
      if (typeof value !== 'string') {
        return;
      }

      const normalizedValue = value.trim();

      if (normalizedValue) {
        nextParams.append(name, normalizedValue);
      }
    });

    const query = nextParams.toString();
    const nextUrl = `${target.pathname}${query ? `?${query}` : ''}${target.hash}`;

    startTransition(() => {
      router.push(nextUrl, { scroll: false });
    });
  }

  return <form action={action} method="get" onSubmit={handleSubmit} {...props} />;
}
