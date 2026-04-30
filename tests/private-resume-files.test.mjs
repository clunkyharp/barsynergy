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
});
