const eslint = require('@eslint/js');
const importPlugin = require('eslint-plugin-import');
const jsxA11yPlugin = require('eslint-plugin-jsx-a11y');
const reactPlugin = require('eslint-plugin-react');
const reactHooksPlugin = require('eslint-plugin-react-hooks');
const simpleImportSortPlugin = require('eslint-plugin-simple-import-sort');
const unusedImportsPlugin = require('eslint-plugin-unused-imports');
const tseslint = require('typescript-eslint');
const topotalTypescriptConfigFlat = require('@topotal/eslint-config-typescript/flat');
const topotalReactConfigFlat = require('@topotal/eslint-config-react/flat');

// Use tseslint.config() as recommended in the official documentation
// https://typescript-eslint.io/getting-started
module.exports = tseslint.config(
  // Include ESLint's recommended configuration
  eslint.configs.recommended,

  // Use typescript-eslint's recommended configuration
  tseslint.configs.recommended,

  // Include Topotal's custom configurations
  topotalTypescriptConfigFlat,
  topotalReactConfigFlat,

  // Override typescript-eslint rules
  {
    files: ['**/*.{ts,tsx}'],
    rules: {
      '@typescript-eslint/indent': 'off',
      'indent': ['error', 2],
    },
  },

  // Add custom rules for TypeScript and React files
  {
    files: ['**/*.{ts,tsx}'],
    plugins: {
      'simple-import-sort': simpleImportSortPlugin,
      'import': importPlugin,
      'unused-imports': unusedImportsPlugin,
      'react': reactPlugin,
      'react-hooks': reactHooksPlugin,
      'jsx-a11y': jsxA11yPlugin,
    },
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
      globals: {
        browser: 'readonly',
      },
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
    rules: {
      'require-atomic-updates': 'off',
      'no-unused-vars': 'off',
      'unused-imports/no-unused-imports': 'error',
      'unused-imports/no-unused-vars': [
        'warn',
        {
          vars: 'all',
          varsIgnorePattern: '^_',
          args: 'after-used',
          argsIgnorePattern: '^_',
        },
      ],
      'simple-import-sort/imports': ['error', {
        groups: [
          [
            // Packages. `react` related packages come first.
            '^react',
            '^@?\\w',
            // Internal packages.
            '^~(/.*|$)',
            // Side effect imports.
            '^\\u0000',
            // Parent imports. Put `..` last.
            '^\\.\\.(?!/?$)', '^\\.\\./?$',
            // Other relative imports. Put same-folder imports and `.` last.
            '^\\./(?=.*/)(?!/?$)', '^\\.(?!/?$)', '^\\./?$',
          ],
        ],
      }],
      'simple-import-sort/exports': 'error',
      'import/first': 'error',
      'import/newline-after-import': 'error',
      'import/no-duplicates': 'error',
      'import/no-default-export': 'error',
      'quotes': ['error', 'single'],
      'semi': ['error', 'never'],
      'comma-dangle': ['error', 'always-multiline'],
      'object-curly-spacing': ['error', 'always'],
      'array-bracket-spacing': ['error', 'never'],
      'eol-last': ['error', 'always'],
      'no-trailing-spaces': 'error',
      'quote-props': ['error', 'as-needed'],
      'key-spacing': ['error', {
        beforeColon: false,
        afterColon: true,
      }],
      'comma-spacing': ['error', { before: false, after: true }],
      'object-shorthand': ['error', 'always'],
      'no-throw-literal': 'error',

      // React rules
      'react/jsx-uses-react': 'error',
      'react/jsx-uses-vars': 'error',

      // React Hooks rules
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
    },
  },
  // Add specific configuration for .ts files that contain hooks
  {
    files: ['**/*.ts'],
    plugins: {
      'react-hooks': reactHooksPlugin,
    },
    rules: {
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
    },
  },
  {
    ignores: [
      'eslint.config.cjs',
      'vite.config.ts',
    ],
  },
  {
    ignores: ['node_modules', 'dist']
  }
);
