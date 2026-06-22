import { Prisma } from '@prisma/client';

export { slugify } from '@/lib/utils/slugify';

export async function findUniqueSlug(baseSlug: string, exists: (candidate: string) => Promise<boolean>) {
  let candidate = baseSlug;
  let suffix = 2;

  while (await exists(candidate)) {
    candidate = `${baseSlug}-${suffix}`;
    suffix += 1;
  }

  return candidate;
}

function isSlugUniqueConstraintError(error: unknown) {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === 'P2002' &&
    Array.isArray(error.meta?.target) &&
    error.meta.target.some((value) => String(value).toLowerCase().includes('slug'))
  );
}

export async function persistWithUniqueSlugRetry<T>(input: {
  baseSlug: string;
  exists: (candidate: string) => Promise<boolean>;
  persist: (candidate: string) => Promise<T>;
  maxAttempts?: number;
}) {
  const maxAttempts = input.maxAttempts ?? 3;
  let attempt = 0;

  while (attempt < maxAttempts) {
    const candidate = await findUniqueSlug(input.baseSlug, input.exists);

    try {
      return await input.persist(candidate);
    } catch (error) {
      if (!isSlugUniqueConstraintError(error) || attempt === maxAttempts - 1) {
        throw error;
      }
    }

    attempt += 1;
  }

  throw new Error('slug retry limit reached');
}
