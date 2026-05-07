'use client';

import { useEffect, useState } from 'react';
import { FileUpload } from '@/components/ui/file-upload';

type CoverImageInputProps = {
  id: string;
  name?: string;
};

const ALLOWED_IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/avif']);
const MAX_IMAGE_SIZE_BYTES = 8 * 1024 * 1024;

export function CoverImageInput({ id, name = 'coverImage' }: CoverImageInputProps) {
  const [fileName, setFileName] = useState('Файл не выбран');
  const [error, setError] = useState<string | null>(null);
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
      <FileUpload
        accept="image/jpeg,image/png,image/webp,image/avif"
        id={id}
        meta={fileName}
        name={name}
        onChange={(event) => {
          const file = event.currentTarget.files?.[0];

          setError(null);

          if (file && !ALLOWED_IMAGE_TYPES.has(file.type)) {
            event.currentTarget.value = '';
            setFileName('Файл не выбран');
            setError('Выберите JPEG, PNG, WebP или AVIF.');
            setPreviewUrl((current) => {
              if (current) {
                URL.revokeObjectURL(current);
              }

              return null;
            });
            return;
          }

          if (file && file.size > MAX_IMAGE_SIZE_BYTES) {
            event.currentTarget.value = '';
            setFileName('Файл не выбран');
            setError('Размер изображения должен быть до 8 МБ.');
            setPreviewUrl((current) => {
              if (current) {
                URL.revokeObjectURL(current);
              }

              return null;
            });
            return;
          }

          setFileName(file?.name ?? 'Файл не выбран');
          setPreviewUrl((current) => {
            if (current) {
              URL.revokeObjectURL(current);
            }

            return file ? URL.createObjectURL(file) : null;
          });
        }}
        title="Выбрать изображение"
        description="JPEG, PNG, WebP или AVIF. После выбора появится предпросмотр."
      />
      {error ? <p className="field-error">{error}</p> : null}
    </div>
  );
}
