/* global fetch */

import { access, readdir } from 'node:fs/promises';
import path from 'node:path';
import { spawn } from 'node:child_process';

const rootDir = process.cwd();
const standaloneDir = path.join(rootDir, '.next', 'standalone');
const staticDir = path.join(rootDir, '.next', 'static');
const publicDir = path.join(rootDir, 'public');
const port = 4011;
const baseUrl = `http://127.0.0.1:${port}`;

async function assertExists(targetPath, label) {
  try {
    await access(targetPath);
  } catch {
    throw new Error(`${label} is missing: ${targetPath}`);
  }
}

async function findFirstMatchingFile(startDir, matcher) {
  const entries = await readdir(startDir, { withFileTypes: true });

  for (const entry of entries) {
    const entryPath = path.join(startDir, entry.name);

    if (entry.isDirectory()) {
      const nested = await findFirstMatchingFile(entryPath, matcher);

      if (nested) {
        return nested;
      }

      continue;
    }

    if (matcher(entry.name)) {
      return entryPath;
    }
  }

  return null;
}

async function waitForServer(url, attempts = 30) {
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    try {
      const response = await fetch(url);

      if (response.ok) {
        return;
      }
    } catch {
      // Server is still starting.
    }

    await new Promise((resolve) => setTimeout(resolve, 250));
  }

  throw new Error(`Standalone server did not become ready at ${url}`);
}

async function assertFetchOk(url, label) {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`${label} returned ${response.status} for ${url}`);
  }
}

await assertExists(standaloneDir, 'Standalone output');
await assertExists(publicDir, 'Public directory');
await assertExists(staticDir, 'Static directory');

const cssFile = await findFirstMatchingFile(path.join(staticDir, 'chunks'), (name) => name.endsWith('.css'));
const fontFile = await findFirstMatchingFile(path.join(staticDir, 'media'), (name) => name.endsWith('.woff2'));
const publicAsset = await findFirstMatchingFile(publicDir, (name) => /\.(svg|png|webp|jpg|jpeg)$/i.test(name));

if (!cssFile) {
  throw new Error('No CSS asset found in .next/static/chunks');
}

if (!fontFile) {
  throw new Error('No font asset found in .next/static/media');
}

if (!publicAsset) {
  throw new Error('No public asset found in public/');
}

const toPosix = (targetPath) => targetPath.split(path.sep).join(path.posix.sep);
const cssUrl = `${baseUrl}/_next/static/${toPosix(path.relative(staticDir, cssFile))}?dpl=local-verify`;
const fontUrl = `${baseUrl}/_next/static/${toPosix(path.relative(staticDir, fontFile))}?dpl=local-verify`;
const publicUrl = `${baseUrl}/${toPosix(path.relative(publicDir, publicAsset))}`;

const server = spawn(process.execPath, ['server.js'], {
  cwd: standaloneDir,
  env: {
    ...process.env,
    PORT: String(port),
    HOSTNAME: '127.0.0.1'
  },
  stdio: ['ignore', 'pipe', 'pipe']
});

let stderr = '';
let closeResult = { code: null, signal: null };
server.stderr.on('data', (chunk) => {
  stderr += chunk.toString();
});
server.on('close', (code, signal) => {
  closeResult = { code, signal };
});

try {
  await waitForServer(baseUrl);
  await assertFetchOk(`${baseUrl}/`, 'Homepage');
  await assertFetchOk(cssUrl, 'Standalone CSS asset');
  await assertFetchOk(fontUrl, 'Standalone font asset');
  await assertFetchOk(publicUrl, 'Standalone public asset');
  console.log('[verify-standalone-runtime] Homepage, CSS, font, and public asset resolved from .next/standalone.');
} finally {
  server.kill('SIGTERM');
  await new Promise((resolve) => server.once('exit', resolve));
}

const terminatedByUs = closeResult.signal === 'SIGTERM' || server.signalCode === 'SIGTERM';

if (!terminatedByUs && closeResult.code && closeResult.code !== 0) {
  throw new Error(`Standalone runtime exited unexpectedly:\n${stderr}`);
}
