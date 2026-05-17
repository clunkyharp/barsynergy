import assert from 'node:assert/strict';
import { Buffer } from 'node:buffer';
import test from 'node:test';

const { isAllowedPrivateResumeUpload } = await import('../src/lib/applications/private-resume-file-rules.ts');
const { isAllowedPublicImageUpload } = await import('../src/lib/storage/file-signatures.ts');

test('private resume validator accepts safe document formats only', () => {
  assert.equal(
    isAllowedPrivateResumeUpload({
      mimeType: 'application/pdf',
      originalName: 'resume.pdf',
      buffer: Buffer.from('%PDF-1.7\n')
    }),
    true
  );

  assert.equal(
    isAllowedPrivateResumeUpload({
      mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      originalName: 'resume.docx',
      buffer: Buffer.from([0x50, 0x4b, 0x03, 0x04])
    }),
    true
  );

  assert.equal(
    isAllowedPrivateResumeUpload({
      mimeType: 'image/png',
      originalName: 'resume.png',
      buffer: Buffer.from([0x89, 0x50, 0x4e, 0x47])
    }),
    false
  );

  assert.equal(
    isAllowedPrivateResumeUpload({
      mimeType: 'application/pdf',
      originalName: 'resume.exe',
      buffer: Buffer.from('%PDF-1.7\n')
    }),
    false
  );

  assert.equal(
    isAllowedPrivateResumeUpload({
      mimeType: 'application/pdf',
      originalName: 'resume.pdf',
      buffer: Buffer.from('not a pdf')
    }),
    false
  );
});

test('public image validator requires matching mime, extension and signature', () => {
  assert.equal(
    isAllowedPublicImageUpload({
      mimeType: 'image/jpeg',
      originalName: 'cover.JPG',
      buffer: Buffer.from([0xff, 0xd8, 0xff])
    }),
    true
  );

  assert.equal(
    isAllowedPublicImageUpload({
      mimeType: 'image/png',
      originalName: 'cover.png',
      buffer: Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])
    }),
    true
  );

  assert.equal(
    isAllowedPublicImageUpload({
      mimeType: 'image/png',
      originalName: 'cover.png',
      buffer: Buffer.from('not a png')
    }),
    false
  );

  assert.equal(
    isAllowedPublicImageUpload({
      mimeType: 'image/png',
      originalName: 'cover.jpg',
      buffer: Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])
    }),
    false
  );

  assert.equal(
    isAllowedPublicImageUpload({
      mimeType: 'image/webp',
      originalName: 'cover.webp',
      buffer: Buffer.from('RIFF0000WEBP', 'ascii')
    }),
    true
  );

  const avifBuffer = Buffer.alloc(12);
  avifBuffer.write('ftyp', 4, 'ascii');
  avifBuffer.write('avif', 8, 'ascii');
  assert.equal(
    isAllowedPublicImageUpload({
      mimeType: 'image/avif',
      originalName: 'cover.avif',
      buffer: avifBuffer
    }),
    true
  );
});

test('private resume validator covers rtf, legacy doc and zip-based document signatures', () => {
  assert.equal(
    isAllowedPrivateResumeUpload({
      mimeType: 'application/rtf',
      originalName: 'resume.rtf',
      buffer: Buffer.from('{\\rtf1')
    }),
    true
  );

  assert.equal(
    isAllowedPrivateResumeUpload({
      mimeType: 'text/rtf',
      originalName: 'resume.rtf',
      buffer: Buffer.from('{\\rtf1')
    }),
    true
  );

  assert.equal(
    isAllowedPrivateResumeUpload({
      mimeType: 'application/msword',
      originalName: 'resume.doc',
      buffer: Buffer.from([0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1])
    }),
    true
  );

  assert.equal(
    isAllowedPrivateResumeUpload({
      mimeType: 'application/vnd.oasis.opendocument.text',
      originalName: 'resume.odt',
      buffer: Buffer.from([0x50, 0x4b, 0x03, 0x04])
    }),
    true
  );

  assert.equal(
    isAllowedPrivateResumeUpload({
      mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      originalName: 'resume.docx'
    }),
    true
  );
});
