import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import globals from 'globals';

export default tseslint.config(
  // Base recommended configs
  js.configs.recommended,
  ...tseslint.configs.recommended,

  // Global ignores
  {
    ignores: [
      'dist/**',
      'node_modules/**',
      'coverage/**',
      '*.js',
      '*.d.ts',
      '*.d.ts.map',
      '*.js.map',
      'rollup.config.js',
      '*.config.js',
      '**/*.test.ts',
      '**/*.spec.ts',
    ],
  },

  // TypeScript files configuration
  {
    files: ['src/**/*.ts', 'src/**/*.tsx'],
    languageOptions: {
      ecmaVersion: 2020,
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.es2020,
      },
    },
    rules: {
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_?',
        },
      ],
      '@typescript-eslint/prefer-as-const': 'error',
      '@typescript-eslint/no-require-imports': 'off', // Allow dynamic require() for React Native compatibility
      'no-console': 'off',
      'prefer-const': 'error',
      'no-var': 'error',
    },
  }
);

