'use client';

import { useState } from 'react';

type CoverImageInputProps = {
  id: string;
};

export function CoverImageInput({ id }: CoverImageInputProps) {
  const [fileName, setFileName] = useState('Файл не выбран');

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
      <label
        className="inline-flex min-h-11 cursor-pointer items-center justify-center rounded-md border border-[var(--line)] bg-white px-4 text-sm font-semibold text-[var(--text)] transition hover:border-[var(--accent)]"
        htmlFor={id}
      >
        Выбрать файл
      </label>
      <span className="text-sm text-[var(--muted)]">{fileName}</span>
      <input
        accept="image/jpeg,image/png,image/webp,image/avif"
        className="sr-only"
        id={id}
        name="coverImage"
        onChange={(event) => setFileName(event.currentTarget.files?.[0]?.name ?? 'Файл не выбран')}
        type="file"
      />
    </div>
  );
}
