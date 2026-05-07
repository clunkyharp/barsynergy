'use client';

import { forwardRef, useState, type ChangeEvent, type InputHTMLAttributes } from 'react';
import { Upload } from 'lucide-react';
import { cn } from '@/lib/utils';

type FileUploadProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> & {
  description?: string;
  meta?: string;
  title?: string;
};

export const FileUpload = forwardRef<HTMLInputElement, FileUploadProps>(function FileUpload(
  {
    accept,
    className,
    description = 'Перетащите файл сюда или выберите его на устройстве.',
    disabled,
    id,
    meta,
    name,
    onChange,
    required,
    title = 'Загрузить файл',
    ...props
  },
  ref
) {
  const [fileName, setFileName] = useState('');

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    onChange?.(event);
    const file = event.currentTarget.files?.[0];
    setFileName(file?.name ?? '');
  }

  return (
    <div className={cn('file-upload', disabled && 'is-disabled', fileName && 'is-filled', className)}>
      <input
        accept={accept}
        className="sr-only"
        disabled={disabled}
        id={id}
        name={name}
        onChange={handleChange}
        ref={ref}
        required={required}
        type="file"
        {...props}
      />
      <label className="file-upload-panel" htmlFor={id}>
        <span className="file-upload-icon" aria-hidden>
          <Upload size={20} strokeWidth={1.8} />
        </span>
        <span className="min-w-0">
          <span className="file-upload-title">{fileName || title}</span>
          <span className="file-upload-description">{fileName ? 'Файл выбран. Его можно заменить перед отправкой.' : description}</span>
          {meta ? <span className="file-upload-meta">{meta}</span> : null}
        </span>
      </label>
    </div>
  );
});
