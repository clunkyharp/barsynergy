'use client';

import { useCallback, useEffect, useRef, useState, type ChangeEvent } from 'react';
import Image from 'next/image';
import { ImageUp, RotateCcw, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { focusFirstElement, trapFocusInContainer } from '@/components/ui/focus-trap';

type AvatarCropperProps = {
  currentAvatarUrl?: string | null;
};

const AVATAR_SIZE = 512;
const AVATAR_QUALITY = 0.9;
const PREVIEW_SIZE = 256;
const MIN_ZOOM = 1;
const MAX_ZOOM = 2.5;

function drawAvatarCrop(input: {
  canvas: HTMLCanvasElement;
  image: HTMLImageElement;
  size: number;
  zoom: number;
}) {
  const { canvas, image, size, zoom } = input;
  const context = canvas.getContext('2d');

  if (!context) return;

  canvas.width = size;
  canvas.height = size;
  context.clearRect(0, 0, size, size);
  context.fillStyle = 'white';
  context.fillRect(0, 0, size, size);

  const baseScale = Math.max(size / image.naturalWidth, size / image.naturalHeight);
  const scale = baseScale * zoom;
  const width = image.naturalWidth * scale;
  const height = image.naturalHeight * scale;
  const x = (size - width) / 2;
  const y = (size - height) / 2;

  context.drawImage(image, x, y, width, height);
}

function canvasToBlob(canvas: HTMLCanvasElement) {
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error('avatar crop failed'));
      },
      'image/jpeg',
      AVATAR_QUALITY
    );
  });
}

export function AvatarCropper({ currentAvatarUrl }: AvatarCropperProps) {
  const sourceInputRef = useRef<HTMLInputElement>(null);
  const outputInputRef = useRef<HTMLInputElement>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const [sourceUrl, setSourceUrl] = useState<string | null>(null);
  const [confirmedPreviewUrl, setConfirmedPreviewUrl] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [error, setError] = useState('');

  useEffect(() => {
    return () => {
      if (sourceUrl) URL.revokeObjectURL(sourceUrl);
      if (confirmedPreviewUrl) URL.revokeObjectURL(confirmedPreviewUrl);
    };
  }, [confirmedPreviewUrl, sourceUrl]);

  useEffect(() => {
    const canvas = previewCanvasRef.current;
    const image = imageRef.current;

    if (!canvas || !image) return;

    drawAvatarCrop({ canvas, image, size: PREVIEW_SIZE, zoom });
  }, [sourceUrl, zoom]);

  const resetSource = useCallback(() => {
    if (sourceUrl) URL.revokeObjectURL(sourceUrl);
    setSourceUrl(null);
    setZoom(1);
    setError('');
    imageRef.current = null;
    if (sourceInputRef.current) {
      sourceInputRef.current.value = '';
    }
  }, [sourceUrl]);

  useEffect(() => {
    if (!sourceUrl) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    focusFirstElement(dialogRef.current);

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        resetSource();
        return;
      }
      trapFocusInContainer(event, dialogRef.current);
    }

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [resetSource, sourceUrl]);

  function handleSourceChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.currentTarget.files?.[0];

    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Выберите изображение JPEG, PNG, WebP или AVIF.');
      return;
    }

    if (sourceUrl) URL.revokeObjectURL(sourceUrl);
    const url = URL.createObjectURL(file);
    const image = new globalThis.Image();
    image.onload = () => {
      imageRef.current = image;
      const canvas = previewCanvasRef.current;
      if (canvas) {
        drawAvatarCrop({ canvas, image, size: PREVIEW_SIZE, zoom: 1 });
      }
    };
    image.onerror = () => {
      setError('Не удалось прочитать изображение. Попробуйте другой файл.');
    };
    image.src = url;
    setSourceUrl(url);
    setZoom(1);
    setError('');
  }

  async function confirmCrop() {
    const image = imageRef.current;
    const outputInput = outputInputRef.current;

    if (!image || !outputInput) {
      setError('Не удалось подготовить фото. Попробуйте выбрать файл ещё раз.');
      return;
    }

    const canvas = document.createElement('canvas');
    drawAvatarCrop({ canvas, image, size: AVATAR_SIZE, zoom });
    const blob = await canvasToBlob(canvas);
    const file = new File([blob], 'avatar-512.jpg', { type: 'image/jpeg' });
    const dataTransfer = new DataTransfer();
    dataTransfer.items.add(file);
    outputInput.files = dataTransfer.files;

    if (confirmedPreviewUrl) URL.revokeObjectURL(confirmedPreviewUrl);
    setConfirmedPreviewUrl(URL.createObjectURL(file));
    resetSource();
  }

  return (
    <div className="space-y-4">
      <input ref={outputInputRef} className="sr-only" name="avatar" type="file" tabIndex={-1} />
      <input
        ref={sourceInputRef}
        accept="image/jpeg,image/png,image/webp,image/avif"
        className="sr-only"
        id="avatar-source"
        onChange={handleSourceChange}
        type="file"
      />

      <div className="flex flex-wrap items-center gap-4 rounded-[var(--radius-lg)] border border-[var(--line)] bg-[var(--surface)] p-4">
        <div className="h-20 w-20 overflow-hidden rounded-full border border-[var(--border-default)] bg-[var(--surface-muted)]">
          {confirmedPreviewUrl || currentAvatarUrl ? (
            <Image
              alt="Предпросмотр аватара"
              className="h-full w-full object-cover"
              src={confirmedPreviewUrl ?? currentAvatarUrl ?? ''}
              width={80}
              height={80}
              unoptimized
            />
          ) : (
            <span className="grid h-full w-full place-items-center text-[var(--muted)]">
              <ImageUp aria-hidden size={22} strokeWidth={1.8} />
            </span>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-[var(--text)]">
            {confirmedPreviewUrl ? 'Фото подготовлено' : 'Подготовьте квадратный аватар'}
          </p>
          <p className="mt-1 text-sm leading-6 text-[var(--muted)]">
            Выберите изображение, настройте масштаб и сохраните обрезку. На сервер уйдёт JPEG 512×512.
          </p>
        </div>
        <Button onClick={() => sourceInputRef.current?.click()} type="button" variant="secondary">
          Выбрать фото
        </Button>
      </div>

      {error ? <p className="text-sm text-[var(--danger-text)]">{error}</p> : null}

      {sourceUrl ? (
        <div
          ref={dialogRef}
          aria-label="Обрезка аватара"
          aria-modal="true"
          className="fixed inset-0 z-50 overflow-y-auto bg-black/65"
          onClick={(event) => {
            if (event.target === event.currentTarget) resetSource();
          }}
          role="dialog"
        >
          <div className="grid min-h-full place-items-center px-4 py-6">
            <div
              className="w-full max-w-md rounded-[var(--radius-lg)] border border-[var(--line)] bg-[var(--surface-elevated)] p-5 shadow-[var(--shadow-panel)]"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-lg font-semibold">Обрезка аватара</h3>
                  <p className="mt-1 text-sm leading-6 text-[var(--muted)]">Круг показывает, как фото будет выглядеть в профиле.</p>
                </div>
                <button
                  aria-label="Закрыть"
                  className="rounded-[var(--radius-sm)] p-2 text-[var(--muted)] hover:bg-[var(--surface-muted)] hover:text-[var(--text)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
                  onClick={resetSource}
                  type="button"
                >
                  <X aria-hidden size={18} strokeWidth={1.8} />
                </button>
              </div>

              <div className="mt-5 grid place-items-center">
                <div className="overflow-hidden rounded-full border border-[var(--border-strong)] bg-[var(--surface-muted)]">
                  <canvas ref={previewCanvasRef} className="block h-64 w-64" />
                </div>
              </div>

              <label className="mt-5 block text-sm font-semibold text-[var(--text)]" htmlFor="avatar-zoom">
                Масштаб
              </label>
              <input
                className="mt-2 w-full accent-[var(--accent)]"
                id="avatar-zoom"
                max={MAX_ZOOM}
                min={MIN_ZOOM}
                onChange={(event) => setZoom(Number(event.currentTarget.value))}
                step="0.05"
                type="range"
                value={zoom}
              />

              <div className="mt-5 flex flex-wrap justify-end gap-2">
                <Button onClick={() => setZoom(1)} type="button" variant="ghost">
                  <RotateCcw aria-hidden size={16} strokeWidth={1.8} />
                  Сбросить
                </Button>
                <Button onClick={resetSource} type="button" variant="secondary">
                  Отмена
                </Button>
                <Button onClick={() => void confirmCrop()} type="button">
                  Сохранить обрезку
                </Button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
