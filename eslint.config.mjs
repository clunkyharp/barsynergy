import js from '@eslint/js';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  {
    ignores: [
      '.astro/**',
      '.next/**',
      'dist/**',
      'node_modules/**',
      'public/**',
      'references/**',
      'scripts/**/*.cjs',
      'test-results/**',
      'output/playwright/**',
      '.playwright-cli/**'
    ]
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['src/**/*.{ts,tsx}', 'next.config.ts'],
    rules: {
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }]
    }
  },
  {
    files: ['scripts/**/*.mjs'],
    languageOptions: {
      globals: {
        console: 'readonly',
        process: 'readonly'
      }
    }
  }
);
