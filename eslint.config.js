// For more info, see https://github.com/storybookjs/eslint-plugin-storybook#configuration-flat-config-format
import storybook from "eslint-plugin-storybook";

import js from '@eslint/js';
import globals from 'globals';
import typescript from '@typescript-eslint/eslint-plugin';
import typescriptParser from '@typescript-eslint/parser';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';

export default [js.configs.recommended, {
  files: ['src/**/*.{ts,tsx}'],
  languageOptions: {
    parser: typescriptParser,
    parserOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      ecmaFeatures: {
        jsx: true,
      },
    },
    globals: {
      ...globals.browser,
      React: 'readonly',
    },
  },
  plugins: {
    '@typescript-eslint': typescript,
    react,
    'react-hooks': reactHooks,
  },
  rules: {
    ...typescript.configs.recommended.rules,
    ...react.configs.recommended.rules,
    ...reactHooks.configs.recommended.rules,
    'react/react-in-jsx-scope': 'off',
    '@typescript-eslint/no-explicit-any': 'error',
    '@typescript-eslint/explicit-function-return-type': 'off',
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
}, {
  ignores: ['dist/**', 'node_modules/**'],
}, ...storybook.configs["flat/recommended"]];
