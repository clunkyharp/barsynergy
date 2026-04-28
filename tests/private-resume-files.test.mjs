import assert from 'node:assert/strict';
import test from 'node:test';

const { isAllowedPrivateResumeUpload } = await import('../src/lib/applications/private-resume-file-rules.ts');

test('private resume validator accepts safe document formats only', () => {
  assert.equal(
    isAllowedPrivateResumeUpload({
      mimeType: 'application/pdf',
      originalName: 'resume.pdf'
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

  assert.equal(
    isAllowedPrivateResumeUpload({
      mimeType: 'image/png',
      originalName: 'resume.png'
    }),
    false
  );

  assert.equal(
    isAllowedPrivateResumeUpload({
      mimeType: 'application/pdf',
      originalName: 'resume.exe'
    }),
    false
  );
});
