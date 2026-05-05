'use client';

import { useEffect, useState } from 'react';

type CoverImageInputProps = {
  id: string;
  name?: string;
};

export function CoverImageInput({ id, name = 'coverImage' }: CoverImageInputProps) {
  const [fileName, setFileName] = useState('Файл не выбран');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  return (
    <div className="grid gap-3">
      {previewUrl ? (
        <div
          aria-label="Предпросмотр обложки"
          className="aspect-[16/9] max-w-md rounded-[var(--radius-md)] border border-[var(--line)] bg-cover bg-center"
          role="img"
          style={{ backgroundImage: `url("${previewUrl}")` }}
        />
      ) : null}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <label
          className="inline-flex min-h-11 cursor-pointer items-center justify-center rounded-md border border-[var(--line)] bg-white px-4 text-sm font-semibold text-[var(--text)] transition hover:border-[var(--accent)]"
          htmlFor={id}
        >
          Выбрать файл
        </label>
        <span className="text-sm text-[var(--muted)]">{fileName}</span>
      </div>
      <input
        accept="image/jpeg,image/png,image/webp,image/avif"
        className="sr-only"
        id={id}
        name={name}
        onChange={(event) => {
          const file = event.currentTarget.files?.[0];
          setFileName(file?.name ?? 'Файл не выбран');
          setPreviewUrl((current) => {
            if (current) {
              URL.revokeObjectURL(current);
            }

            return file ? URL.createObjectURL(file) : null;
          });
        }}
        type="file"
      />
    </div>
  );
}
