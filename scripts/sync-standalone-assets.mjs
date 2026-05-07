import { access, cp, mkdir, rm } from 'node:fs/promises';
import path from 'node:path';

const rootDir = process.cwd();
const publicDir = path.join(rootDir, 'public');
const nextStaticDir = path.join(rootDir, '.next', 'static');
const standaloneRootDir = path.join(rootDir, '.next', 'standalone');
const standalonePublicDir = path.join(standaloneRootDir, 'public');
const standaloneStaticDir = path.join(standaloneRootDir, '.next', 'static');

async function pathExists(targetPath) {
  try {
    await access(targetPath);
    return true;
  } catch {
    return false;
  }
}

async function syncDirectory(sourceDir, targetDir) {
  if (!(await pathExists(sourceDir))) {
    return;
  }

  await rm(targetDir, { recursive: true, force: true });
  await mkdir(path.dirname(targetDir), { recursive: true });
  await cp(sourceDir, targetDir, { recursive: true, force: true });
}

await syncDirectory(publicDir, standalonePublicDir);
await syncDirectory(nextStaticDir, standaloneStaticDir);

console.log('[sync-standalone-assets] Synced public/ and .next/static into .next/standalone runtime.');
