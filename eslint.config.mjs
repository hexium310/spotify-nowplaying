/* eslint-disable import/no-named-as-default-member */
import js from '@eslint/js';
import stylistic from '@stylistic/eslint-plugin';
import gitinore from 'eslint-config-flat-gitignore';
import importPlugin from 'eslint-plugin-import';
import globals from 'globals';
import typescriptEslint from 'typescript-eslint';

/** @type {import('eslint').Linter.Config[]} */
export default [
  gitinore(),
  {
    languageOptions: {
      globals: {
        ...globals.browser,
      },
    },
  },
  {
    files: ['eslint.config.mjs'],
    settings: {
      // Silence an error where it cannot resolve the path to module 'typescript-eslint'.
      'import/resolver': {
        typescript: {
          alwaysTryTypes: true,
        },
      },
    },
  },
  js.configs.recommended,
  importPlugin.flatConfigs.recommended,
  stylistic.configs.customize({
    braceStyle: '1tbs',
    semi: true,
  }),
  {
    rules: {
      '@stylistic/arrow-parens': ['error', 'always'],
      '@stylistic/comma-dangle': ['error', {
        arrays: 'always-multiline',
        enums: 'always-multiline',
        exports: 'always-multiline',
        imports: 'always-multiline',
        objects: 'always-multiline',
        tuples: 'always-multiline',
      }],
      'import/newline-after-import': ['error'],
      'import/order': ['error', {
        alphabetize: {
          order: 'asc',
        },
      }],
      'no-empty': ['error', {
        allowEmptyCatch: true,
      }],
    },
  },
  ...typescriptEslint.configs.strict,
  ...typescriptEslint.configs.stylistic,
  importPlugin.flatConfigs.typescript,
  {
    files: [
      '**/*.ts',
    ],
    settings: {
      'import/resolver': {
        typescript: {
          alwaysTryTypes: true,
        },
      },
    },
    ...typescriptEslint.configs.base,
    languageOptions: {
      ...typescriptEslint.configs.base.languageOptions,
      parserOptions: {
        project: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      '@typescript-eslint/explicit-function-return-type': ['warn', {
        allowExpressions: true,
        allowTypedFunctionExpressions: true,
      }],
      '@typescript-eslint/naming-convention': [
        'error',
        {
          format: ['camelCase'],
          leadingUnderscore: 'allow',
          selector: [
            'variableLike',
            'parameterProperty',
            'accessor',
            'enumMember',
            'method',
          ],
          trailingUnderscore: 'allow',
        },
        {
          filter: { match: false, regex: '^(Authorization|Accept-Language)$' },
          format: ['camelCase'],
          leadingUnderscore: 'allow',
          selector: 'property',
          trailingUnderscore: 'allow',
        },
        {
          format: ['camelCase', 'UPPER_CASE'],
          leadingUnderscore: 'allow',
          selector: 'variable',
          trailingUnderscore: 'allow',
        },
        {
          format: ['PascalCase'],
          selector: 'typeLike',
        },
      ],
      '@typescript-eslint/no-unused-vars': ['error', {
        caughtErrorsIgnorePattern: '^_$',
      }],
    },
  },
];
