import js from '@eslint/js';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  {
    ignores: [
      '.agents/**',
      '.astro/**',
      '.claude/**',
      '.github/**',
      '.next/**',
      'dist/**',
      'node_modules/**',
      'public/**',
      'references/**',
      'scripts/**/*.cjs',
      'audit/**',
      'test-results/**',
      'output/**',
      '.playwright-cli/**'
    ]
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['src/**/*.{ts,tsx}', 'next.config.ts'],
    rules: {
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/no-explicit-any': 'error'
    }
  },
  {
    files: ['scripts/**/*.mjs'],
    languageOptions: {
      globals: {
        console: 'readonly',
        process: 'readonly',
        window: 'readonly',
        document: 'readonly',
        setTimeout: 'readonly',
        setInterval: 'readonly',
        clearTimeout: 'readonly',
      }
    }
  },
  {
    files: ['src/**/page.tsx', 'src/**/layout.tsx'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          paths: [
            {
              name: '@prisma/client',
              message: 'Pages/layouts must not import Prisma directly. Use lib/public/, lib/admin/, or modules/ queries.'
            },
            {
              name: '@/lib/db/prisma',
              message: 'Pages/layouts must not import Prisma directly. Use lib/public/, lib/admin/, or modules/ queries.'
            }
          ]
        }
      ]
    }
  },
  {
    files: ['src/components/**'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@/app/**/actions', '@/app/**/actions/*'],
              message: 'Components must not import server actions from app/. Pass actions as props from page.tsx.'
            }
          ]
        }
      ]
    }
  }
);
