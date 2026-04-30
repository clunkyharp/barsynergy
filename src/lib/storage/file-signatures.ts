import path from 'node:path';

const PUBLIC_IMAGE_SIGNATURES = {
  'image/jpeg': {
    extensions: new Set(['.jpg', '.jpeg']),
    matches: (buffer: Buffer) => buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff
  },
  'image/png': {
    extensions: new Set(['.png']),
    matches: (buffer: Buffer) =>
      buffer.length >= 8 &&
      buffer[0] === 0x89 &&
      buffer[1] === 0x50 &&
      buffer[2] === 0x4e &&
      buffer[3] === 0x47 &&
      buffer[4] === 0x0d &&
      buffer[5] === 0x0a &&
      buffer[6] === 0x1a &&
      buffer[7] === 0x0a
  },
  'image/webp': {
    extensions: new Set(['.webp']),
    matches: (buffer: Buffer) =>
      buffer.length >= 12 && buffer.subarray(0, 4).toString('ascii') === 'RIFF' && buffer.subarray(8, 12).toString('ascii') === 'WEBP'
  },
  'image/avif': {
    extensions: new Set(['.avif']),
    matches: (buffer: Buffer) =>
      buffer.length >= 12 &&
      buffer.subarray(4, 8).toString('ascii') === 'ftyp' &&
      ['avif', 'avis'].includes(buffer.subarray(8, 12).toString('ascii'))
  }
} as const;

const PRIVATE_RESUME_SIGNATURES = {
  'application/pdf': {
    extensions: new Set(['.pdf']),
    matches: (buffer: Buffer) => buffer.length >= 5 && buffer.subarray(0, 5).toString('ascii') === '%PDF-'
  },
  'application/rtf': {
    extensions: new Set(['.rtf']),
    matches: (buffer: Buffer) => buffer.length >= 5 && buffer.subarray(0, 5).toString('ascii') === '{\\rtf'
  },
  'text/rtf': {
    extensions: new Set(['.rtf']),
    matches: (buffer: Buffer) => buffer.length >= 5 && buffer.subarray(0, 5).toString('ascii') === '{\\rtf'
  },
  'application/msword': {
    extensions: new Set(['.doc']),
    matches: (buffer: Buffer) =>
      buffer.length >= 8 &&
      buffer[0] === 0xd0 &&
      buffer[1] === 0xcf &&
      buffer[2] === 0x11 &&
      buffer[3] === 0xe0 &&
      buffer[4] === 0xa1 &&
      buffer[5] === 0xb1 &&
      buffer[6] === 0x1a &&
      buffer[7] === 0xe1
  },
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': {
    extensions: new Set(['.docx']),
    matches: (buffer: Buffer) => buffer.length >= 4 && buffer[0] === 0x50 && buffer[1] === 0x4b && buffer[2] === 0x03 && buffer[3] === 0x04
  },
  'application/vnd.oasis.opendocument.text': {
    extensions: new Set(['.odt']),
    matches: (buffer: Buffer) => buffer.length >= 4 && buffer[0] === 0x50 && buffer[1] === 0x4b && buffer[2] === 0x03 && buffer[3] === 0x04
  }
} as const;

export function isAllowedPublicImageUpload(input: { mimeType: string; originalName: string; buffer: Buffer }) {
  const signature = PUBLIC_IMAGE_SIGNATURES[input.mimeType as keyof typeof PUBLIC_IMAGE_SIGNATURES];
  const extension = path.extname(input.originalName).toLowerCase();
  return Boolean(signature && signature.extensions.has(extension) && signature.matches(input.buffer));
}

export function isAllowedPrivateResumeUpload(input: { mimeType: string; originalName: string; buffer?: Buffer }) {
  const signature = PRIVATE_RESUME_SIGNATURES[input.mimeType as keyof typeof PRIVATE_RESUME_SIGNATURES];
  const extension = path.extname(input.originalName).toLowerCase();

  if (!signature || !signature.extensions.has(extension)) {
    return false;
  }

  return input.buffer ? signature.matches(input.buffer) : true;
}
