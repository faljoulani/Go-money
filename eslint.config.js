// eslint.config.js
const next = require('@next/eslint-plugin-next');
const react = require('eslint-plugin-react');
const prettierRecommended = require('eslint-plugin-prettier/recommended');
const reactHooks = require('eslint-plugin-react-hooks');
const ts = require('@typescript-eslint/eslint-plugin');
const tsParser = require('@typescript-eslint/parser');

module.exports = [
  // Ignore globs
  {
    ignores: ['**/dist/**', 'public/**', 'sitefinity-e2e-tests', 'eslint.config.js'],
  },

  // JS/TS sources
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    plugins: {
      '@next/next': next,
      react,
      'react-hooks': reactHooks,
      '@typescript-eslint': ts,
    },
    languageOptions: {
      parser: tsParser,
      ecmaVersion: 2023,
      sourceType: 'module',
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    settings: {
      react: { version: 'detect' },
    },
    rules: {
      // Next.js core-web-vitals
      ...next.configs['core-web-vitals'].rules,

      // React recommended (adjusted for Next 13+ / automatic JSX runtime)
      ...react.configs.recommended.rules,
      'react/react-in-jsx-scope': 'off',
      'react/jsx-uses-react': 'off',

      // Keep logic/best-practice rules (not formatting)
      'react-hooks/exhaustive-deps': 'warn',
      curly: 'error',
      'default-case': 'error',
      eqeqeq: ['error', 'smart'],
      'react/no-children-prop': 'off',
      'react/no-find-dom-node': 'warn',
      'guard-for-in': 'error',
      'id-blacklist': ['error', 'any', 'Number', 'String', 'Boolean'],
      'id-match': 'error',
      'react/jsx-key': 'warn',
      'no-bitwise': 'error',
      'no-caller': 'error',
      'no-console': 'off',
      'no-debugger': 'error',
      'no-empty': 'error',
      'no-eval': 'error',
      'no-fallthrough': 'error',
      'no-new-wrappers': 'error',
      'no-unused-labels': 'error',
      'no-var': 'error',
      radix: 'warn',
      'react/prop-types': 'off',
      'react/display-name': 'off',
      'react/jsx-no-bind': 'off',
      'react/self-closing-comp': 'error',
      'react/no-unescaped-entities': 'warn',

      // ❌ Formatting rules are handled by Prettier (via the config below)
    },

    ignores: ['**/dist/**', 'public/**', 'sitefinity-e2e-tests', 'eslint.config.js'],
  },

  // Prettier: disables conflicting ESLint rules and reports Prettier issues
  prettierRecommended,
];

