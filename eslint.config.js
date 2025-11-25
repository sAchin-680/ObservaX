// ESLint v9+ config migration from .eslintrc.json

/** @type {import('eslint').Linter.Config} */
import js from '@eslint/js';

import tsParser from '@typescript-eslint/parser';

export default [
  {
    ignores: [
      'services/web/.next/',
      'services/web/static/',
      'services/web/dev/',
      'services/web/types/',
      'services/web/app/polyfills.js',
      'services/web/app/api/',
      'services/web/app/tests/',
      'services/web/app/public/',
      'services/web/app/node_modules/',
      'services/web/app/.turbo/',
      'services/web/app/.cache/',
      'services/web/app/.eslintcache',
      'services/web/app/.env*',
      'services/web/app/.DS_Store',
      'services/web/app/*.log',
      'services/web/app/*.tmp',
    ],
  },
  {
    files: ['**/*.ts', 'worker/src/**/*.ts'],
    languageOptions: {
      parser: tsParser,
      ecmaVersion: 2021,
      sourceType: 'module',
      globals: {
        window: 'readonly',
        document: 'readonly',
        console: 'readonly',
        process: 'readonly',
      },
    },
    rules: {
      semi: ['error', 'always'],
      quotes: ['error', 'single'],
      'no-unused-vars': 'warn',
    },
  },
  {
    files: ['**/*.js'],
    ...js.configs.recommended,
    languageOptions: {
      ecmaVersion: 2021,
      sourceType: 'module',
      globals: {
        window: 'readonly',
        document: 'readonly',
        console: 'readonly',
        process: 'readonly',
      },
    },
    rules: {
      semi: ['error', 'always'],
      quotes: ['error', 'single'],
      'no-unused-vars': 'warn',
    },
  },
];
