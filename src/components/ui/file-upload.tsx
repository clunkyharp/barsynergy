'use client';

import { forwardRef, useEffect, useId, useState, type ChangeEvent, type InputHTMLAttributes } from 'react';
import { useFormStatus } from 'react-dom';
import { CheckCircle2, FileLock2, Loader2, TriangleAlert, Upload } from 'lucide-react';
import { cn } from '@/lib/utils';

function uploadFileState(error: string | undefined, isUploading: boolean, fileName: string) {
  if (error) return 'error';
  if (isUploading) return 'uploading';
  if (fileName) return 'success';
  return undefined;
}

function uploadDescription(error: string | undefined, isUploading: boolean, fileName: string, effectiveSuccess: string | undefined, uploadPendingText: string | undefined, description: string | undefined) {
  if (error) return error;
  if (isUploading) return uploadPendingText;
  if (fileName) return effectiveSuccess ?? 'Файл выбран. Его можно заменить перед отправкой.';
  return description;
}

type FileUploadProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> & {
  description?: string;
  error?: string;
  meta?: string;
  privacy?: 'private' | 'public';
  privacyLabel?: string;
  success?: string;
  title?: string;
  uploadPendingText?: string;
};

export const FileUpload = forwardRef<HTMLInputElement, FileUploadProps>(function FileUpload(
  {
    accept,
    className,
    description = 'Перетащите файл сюда или выберите его на устройстве.',
    disabled,
    error,
    id,
    meta,
    name,
    onChange,
    privacy,
    privacyLabel,
    required,
    success,
    title = 'Загрузить файл',
    uploadPendingText = 'Файл загружается. Дождитесь завершения отправки.',
    'aria-describedby': ariaDescribedBy,
    'aria-invalid': ariaInvalid,
    ...props
  },
  ref
) {
  const [fileName, setFileName] = useState('');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const { pending } = useFormStatus();

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);
  const generatedId = useId();
  const fieldId = id ?? generatedId;
  const errorId = `${fieldId}-error`;
  const successId = `${fieldId}-success`;
  const privacyId = `${fieldId}-privacy`;
  const isUploading = pending && Boolean(fileName);
  const effectiveSuccess = fileName ? success : undefined;
  const state = uploadFileState(error, isUploading, fileName);
  const describedBy =
    [
      ariaDescribedBy,
      privacy ? privacyId : undefined,
      error ? errorId : undefined,
      !error && effectiveSuccess ? successId : undefined
    ]
      .filter(Boolean)
      .join(' ') || undefined;

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    onChange?.(event);
    const file = event.currentTarget.files?.[0];
    setFileName(file?.name ?? '');
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(file?.type.startsWith('image/') ? URL.createObjectURL(file) : null);
  }

  return (
    <div
      className={cn(
        'file-upload',
        disabled && 'is-disabled',
        fileName && 'is-filled',
        isUploading && 'is-uploading',
        error && 'is-invalid',
        effectiveSuccess && !error && 'is-success',
        privacy === 'private' && 'is-private',
        className
      )}
      data-state={state}
      data-privacy={privacy}
    >
      <input
        accept={accept}
        aria-describedby={describedBy}
        aria-invalid={error ? true : ariaInvalid}
        className="sr-only"
        disabled={disabled}
        id={fieldId}
        name={name}
        onChange={handleChange}
        ref={ref}
        required={required}
        type="file"
        {...props}
      />
      <label className="file-upload-panel" htmlFor={fieldId}>
        {previewUrl && !error ? (
          <img
            alt=""
            aria-hidden
            className="file-upload-preview"
            src={previewUrl}
          />
        ) : (
          <span className="file-upload-icon" aria-hidden>
            {error ? (
              <TriangleAlert size={20} strokeWidth={1.8} />
            ) : isUploading ? (
              <Loader2 className="file-upload-spinner" size={20} strokeWidth={1.8} />
            ) : effectiveSuccess || fileName ? (
              <CheckCircle2 size={20} strokeWidth={1.8} />
            ) : privacy === 'private' ? (
              <FileLock2 size={20} strokeWidth={1.8} />
            ) : (
              <Upload size={20} strokeWidth={1.8} />
            )}
          </span>
        )}
        <span className="min-w-0">
          <span className="file-upload-title">{fileName || title}</span>
          <span className="file-upload-description">
            {uploadDescription(error, isUploading, fileName, effectiveSuccess, uploadPendingText, description)}
          </span>
          {meta ? <span className="file-upload-meta">{meta}</span> : null}
          {privacy ? (
            <span className="file-upload-privacy" id={privacyId}>
              {privacyLabel ?? (privacy === 'private' ? 'Файл будет доступен только команде после проверки заявки.' : 'Файл будет использоваться как публичный материал после публикации.')}
            </span>
          ) : null}
        </span>
      </label>
      {error ? (
        <p className="file-upload-error" id={errorId}>
          {error}
        </p>
      ) : null}
      {!error && effectiveSuccess ? (
        <p className="file-upload-success" id={successId}>
          {effectiveSuccess}
        </p>
      ) : null}
    </div>
  );
});
