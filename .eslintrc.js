'use strict'

module.exports = {
  root: true,
  globals: {},
  env: {
    node: true,
    jest: true
  },
  extends: [
    'plugin:@typescript-eslint/recommended',
    'plugin:@typescript-eslint/eslint-recommended',
    'plugin:@intlify/vue-i18n/recommended',
    'plugin:prettier/recommended',
    'prettier'
  ],
  plugins: ['@typescript-eslint', 'mocha'],
  parserOptions: {
    parser: '@typescript-eslint/parser',
    sourceType: 'module'
  },
  overrides: [
    {
      files: ['*.json', '*.json5'],
      extends: ['plugin:@intlify/vue-i18n/base']
    },
    {
      files: ['*.yaml', '*.yml'],
      extends: ['plugin:@intlify/vue-i18n/base']
    }
  ],
  rules: {
    'mocha/no-mocha-arrows': 'error',
    'object-curly-spacing': 'off',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/member-delimiter-style': 'off',
    '@typescript-eslint/no-use-before-define': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/ban-ts-comment': 'off',
    '@typescript-eslint/no-non-null-assertion': 'off',
    '@typescript-eslint/triple-slash-reference': 'off',
    '@intlify/vue-i18n/no-dynamic-keys': 'error',
    '@intlify/vue-i18n/no-unused-keys': [
      'error',
      {
        extensions: ['.ts']
      }
    ]
  },
  settings: {
    'vue-i18n': {
      localeDir: './locales/*.json',
      messageSyntaxVersion: '^9.0.0'
    }
  }
}
