import { getPublicFileUrl } from '@/lib/storage/public-url';

type AvatarFileReference = {
  fileKey: string;
  bucket: string | null;
} | null | undefined;

export function getProfileAvatarUrl(file: AvatarFileReference) {
  if (!file) {
    return null;
  }

  return getPublicFileUrl({
    fileKey: file.fileKey,
    bucket: file.bucket ?? undefined,
    visibility: 'public'
  });
}
