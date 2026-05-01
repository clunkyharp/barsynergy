import { ZodError } from 'zod';

type KnownServerActionError = {
  matches: (error: Error) => boolean;
  message: string;
};

type ResolveServerActionErrorInput = {
  action: string;
  error: unknown;
  zodMessage?: string;
  known?: KnownServerActionError[];
  fallbackMessage: string;
};

function isRedirectError(error: unknown) {
  if (typeof error !== 'object' || error === null || !('digest' in error) || typeof error.digest !== 'string') {
    return false;
  }

  const [errorCode, redirectType] = error.digest.split(';');
  return errorCode === 'NEXT_REDIRECT' && (redirectType === 'replace' || redirectType === 'push');
}

function logUnexpectedActionError(action: string, error: unknown) {
  if (error instanceof Error) {
    console.error(`[${action}] Unexpected server action error.`, {
      name: error.name,
      message: error.message
    });
    return;
  }

  console.error(`[${action}] Unexpected non-error server action failure.`, {
    valueType: typeof error
  });
}

export function hasErrorMessage(error: Error, fragment: string) {
  return error.message.includes(fragment);
}

export function resolveServerActionError(input: ResolveServerActionErrorInput) {
  if (isRedirectError(input.error)) {
    throw input.error;
  }

  if (input.error instanceof ZodError) {
    return input.zodMessage ?? input.fallbackMessage;
  }

  if (input.error instanceof Error) {
    const error = input.error;
    const knownError = input.known?.find((candidate) => candidate.matches(error));

    if (knownError) {
      return knownError.message;
    }

    logUnexpectedActionError(input.action, error);
    return input.fallbackMessage;
  }

  logUnexpectedActionError(input.action, input.error);
  return input.fallbackMessage;
}
