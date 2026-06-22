import { redirect } from 'next/navigation';
import { hasErrorMessage, resolveServerActionError } from '../actions/server-action-errors';
import { getString } from '@/lib/forms/form-data';

export function safeAdminRedirectPath(formData: FormData, fallbackPath: string, allowedBasePaths: string[] = [fallbackPath]) {
  const value = getString(formData, 'redirectTo');
  return allowedBasePaths.some((basePath) => value === basePath || value.startsWith(`${basePath}?`)) ? value : fallbackPath;
}

export function adminActionResultPath(
  targetPath: string,
  result: { type: 'success' | 'error'; message: string }
) {
  const url = new URL(targetPath, 'http://localhost');
  url.searchParams.delete('success');
  url.searchParams.delete('error');
  url.searchParams.set(result.type, result.message);
  return `${url.pathname}${url.search}`;
}

export function redirectWithAdminActionResult(
  targetPath: string,
  result: { type: 'success' | 'error'; message: string }
): never {
  redirect(adminActionResultPath(targetPath, result));
}

export function formatAdminActionError(error: unknown) {
  return resolveServerActionError({
    action: 'admin:content',
    error,
    zodMessage: 'Проверьте обязательные поля и формат значений.',
    known: [
      {
        matches: (candidate) => hasErrorMessage(candidate, 'External URL must use http or https'),
        message: 'Укажите корректный внешний адрес с http:// или https://.'
      },
      {
        matches: (candidate) => hasErrorMessage(candidate, 'public asset path is invalid'),
        message: 'Укажите путь к публичному файлу от корня сайта, например /brand/logo.png.'
      },
      {
        matches: (candidate) => hasErrorMessage(candidate, 'homepage link is invalid'),
        message: 'Укажите внутренний путь от / или внешний адрес с http:// или https://.'
      },
      {
        matches: (candidate) => hasErrorMessage(candidate, 'published content cannot be deleted'),
        message: 'Опубликованную запись нельзя удалить. Переведите ее в архив.'
      },
      {
        matches: (candidate) => hasErrorMessage(candidate, 'draft is invalid'),
        message: 'Черновик не найден или уже недоступен для удаления.'
      },
      {
        matches: (candidate) => hasErrorMessage(candidate, 'record is invalid'),
        message: 'Удалять можно только черновики. Чтобы убрать запись с сайта, переведите её в архив.'
      },
      {
        matches: (candidate) => hasErrorMessage(candidate, 'slug is required'),
        message: 'Укажите slug или заголовок, из которого можно создать slug.'
      },
      {
        matches: (candidate) => hasErrorMessage(candidate, 'category is invalid'),
        message: 'Выбранная категория недоступна для этого раздела.'
      },
      {
        matches: (candidate) => hasErrorMessage(candidate, 'city is invalid'),
        message: 'Выбранный город недоступен.'
      },
      {
        matches: (candidate) => hasErrorMessage(candidate, 'tag is invalid'),
        message: 'Выбранный тег недоступен.'
      },
      {
        matches: (candidate) => hasErrorMessage(candidate, 'end date cannot be before start date'),
        message: 'Дата окончания не может быть раньше даты начала.'
      },
      {
        matches: (candidate) => hasErrorMessage(candidate, 'Unsupported image type'),
        message: 'Загрузите изображение JPEG, PNG, WebP или AVIF.'
      },
      {
        matches: (candidate) => hasErrorMessage(candidate, 'File is too large'),
        message: 'Файл слишком большой для текущего лимита загрузки.'
      }
    ],
    fallbackMessage: 'Не удалось сохранить изменения. Проверьте данные и повторите попытку.'
  });
}
