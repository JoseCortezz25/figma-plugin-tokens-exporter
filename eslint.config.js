import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
// import reactRefresh from 'eslint-plugin-react-refresh'
// import prettier from 'prettier'
import prettier from 'eslint-config-prettier';
import tseslint from 'typescript-eslint';
import standard from 'eslint-config-standard';

export default tseslint.config(
  {
    ignores: ['dist']
  },
  {
    extends: [
      js.configs.recommended,
      ...tseslint.configs.recommended
      // prettier.rules
    ],
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser
    },
    plugins: {
      prettier: prettier
    },
    rules: {
      'jsx-quotes': ['error', 'prefer-double'],
      semi: [2, 'always'],
      'space-before-function-paren': 'off',
      camelcase: [
        'error',
        {
          allow: ['api_url', 'other_identifier']
        }
      ],
      'no-unused-vars': 'off',
      'comma-dangle': [
        'error',
        {
          functions: 'never'
        }
      ],
      'no-debugger': 'off'
    }
  }
);
