'use client';

import { useRef, useState, type ChangeEvent } from 'react';
import { CheckCircle2, Loader2, TriangleAlert, Upload } from 'lucide-react';
import { FormField } from '@/components/ui/form-field';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

type ImagePickerFieldProps = {
  defaultValue?: string | null;
  hint?: string;
  id: string;
  label: string;
  name: string;
  placeholder?: string;
};

function readStringProperty(value: unknown, key: string) {
  if (!value || typeof value !== 'object') {
    return undefined;
  }

  const candidate = (value as Record<string, unknown>)[key];
  return typeof candidate === 'string' ? candidate : undefined;
}

function getUploadUrl(value: unknown) {
  return readStringProperty(value, 'publicUrl') ?? readStringProperty(value, 'url');
}

export function ImagePickerField({ defaultValue, hint, id, label, name, placeholder }: ImagePickerFieldProps) {
  const hiddenInputRef = useRef<HTMLInputElement>(null);
  const [value, setValue] = useState(defaultValue ?? '');
  const [fileName, setFileName] = useState('');
  const [error, setError] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  function setFieldValue(nextValue: string) {
    setValue(nextValue);

    if (hiddenInputRef.current) {
      hiddenInputRef.current.value = nextValue;
      hiddenInputRef.current.dispatchEvent(new Event('change', { bubbles: true }));
    }
  }

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.currentTarget.files?.[0];
    setError('');

    if (!file) {
      setFileName('');
      return;
    }

    setFileName(file.name);
    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/admin/uploads/content-image', {
        body: formData,
        method: 'POST'
      });
      const payload: unknown = await response.json().catch(() => null);

      if (!response.ok) {
        setError(readStringProperty(payload, 'error') ?? 'Не удалось загрузить изображение.');
        return;
      }

      const uploadedUrl = getUploadUrl(payload);
      if (!uploadedUrl) {
        setError('Загрузка прошла, но сервер не вернул путь к файлу.');
        return;
      }

      setFieldValue(uploadedUrl);
    } catch {
      setError('Не удалось загрузить изображение.');
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <FormField label={label} htmlFor={id} hint={error || hint}>
      <div className="grid gap-3">
        <input ref={hiddenInputRef} name={name} type="hidden" value={value} readOnly />
        <div className={cn('file-upload', value && 'is-filled', isUploading && 'is-uploading', error && 'is-invalid')}>
          <input
            accept="image/avif,image/jpeg,image/png,image/webp"
            className="sr-only"
            id={id}
            onChange={handleFileChange}
            type="file"
          />
          <label className="file-upload-panel" htmlFor={id}>
            {value && !error ? (
              <img alt="" aria-hidden className="file-upload-preview" src={value} />
            ) : (
              <span className="file-upload-icon" aria-hidden>
                {error ? (
                  <TriangleAlert size={20} strokeWidth={1.8} />
                ) : isUploading ? (
                  <Loader2 className="file-upload-spinner" size={20} strokeWidth={1.8} />
                ) : value ? (
                  <CheckCircle2 size={20} strokeWidth={1.8} />
                ) : (
                  <Upload size={20} strokeWidth={1.8} />
                )}
              </span>
            )}
            <span className="min-w-0">
              <span className="file-upload-title">{fileName || (value ? 'Изображение выбрано' : 'Загрузить изображение')}</span>
              <span className="file-upload-description">
                {error || (isUploading ? 'Загружаем файл.' : value ? value : 'JPEG, PNG, WebP или AVIF до 8 МБ.')}
              </span>
            </span>
          </label>
        </div>
        <details className="group/image-path rounded-[var(--radius-sm)] border border-[var(--line)] bg-[var(--surface-muted)] px-3 py-2">
          <summary className="cursor-pointer list-none text-xs font-semibold uppercase tracking-[0.08em] text-[var(--muted)] [&::-webkit-details-marker]:hidden">
            Указать путь вручную
          </summary>
          <Input
            className="mt-3"
            maxLength={500}
            onChange={(event) => setFieldValue(event.currentTarget.value)}
            placeholder={placeholder}
            value={value}
          />
        </details>
      </div>
    </FormField>
  );
}
