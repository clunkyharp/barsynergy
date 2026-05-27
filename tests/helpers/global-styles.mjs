import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import process from 'node:process';

const repoRoot = process.cwd();

export function readGlobalStyles() {
  const globalsPath = join(repoRoot, 'src/app/globals.css');
  const globals = readFileSync(globalsPath, 'utf8');
  const imports = Array.from(globals.matchAll(/@import "\.\/styles\/([^"]+)";/g)).map((match) =>
    readFileSync(join(repoRoot, 'src/app/styles', match[1]), 'utf8')
  );

  return [globals, ...imports].join('\n');
}
