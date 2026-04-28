import path from 'node:path';

const ALLOWED_PRIVATE_RESUME_TYPES = new Set([
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/rtf',
  'text/rtf',
  'application/vnd.oasis.opendocument.text'
]);

const ALLOWED_PRIVATE_RESUME_EXTENSIONS = new Set(['.pdf', '.doc', '.docx', '.rtf', '.odt']);

export function isAllowedPrivateResumeUpload(input: { mimeType: string; originalName: string }) {
  const extension = path.extname(input.originalName).toLowerCase();
  return ALLOWED_PRIVATE_RESUME_TYPES.has(input.mimeType) && ALLOWED_PRIVATE_RESUME_EXTENSIONS.has(extension);
}
