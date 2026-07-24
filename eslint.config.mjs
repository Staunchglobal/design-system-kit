import js from '@eslint/js'
import babelParser from '@babel/eslint-parser'
import globals from 'globals'

export default [
  {
    ignores: ['dist/**', 'node_modules/**', 'src/generated/registry.ts'],
  },
  {
    files: ['src/**/*.ts', 'tsup.config.ts'],
    languageOptions: {
      parser: babelParser,
      parserOptions: {
        requireConfigFile: false,
        babelOptions: {
          presets: ['@babel/preset-typescript'],
        },
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
      globals: globals.node,
    },
    rules: {
      ...js.configs.recommended.rules,
      // Babel parses TS 7 syntax without coupling ESLint to the installed TS compiler, but its
      // scope manager treats type-only names as values. `tsc --noEmit` owns these two checks.
      'no-undef': 'off',
      'no-unused-vars': 'off',
    },
  },
  {
    files: ['scripts/**/*.mjs'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: globals.node,
    },
    rules: js.configs.recommended.rules,
  },
]
