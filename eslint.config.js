// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');
const boundaries = require('eslint-plugin-boundaries');

const sharedTypes = ['components', 'hooks', 'lib', 'constants', 'config', 'utils', 'types'];

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ['dist/*', 'src/lib/api-schema.d.ts'],
  },
  {
    files: ['src/**/*.{ts,tsx}'],
    plugins: { boundaries },
    settings: {
      'import/resolver': {
        typescript: { alwaysTryTypes: true },
      },
      'boundaries/elements': [
        { type: 'app', pattern: 'src/app' },
        { type: 'providers', pattern: 'src/providers' },
        { type: 'feature', pattern: 'src/features/*', capture: ['featureName'] },
        ...sharedTypes.map((type) => ({ type, pattern: `src/${type}` })),
      ],
    },
    rules: {
      'boundaries/dependencies': [
        'error',
        {
          default: 'disallow',
          message: '{{from.element.types}} cannot import {{to.element.types}}',
          policies: [
            {
              from: { element: { types: { anyOf: ['app', 'providers', 'feature', ...sharedTypes] } } },
              allow: { to: { element: { types: { anyOf: sharedTypes } } } },
            },
            {
              from: { element: { type: 'app' } },
              allow: { to: { element: { types: { anyOf: ['app', 'providers', 'feature'] } } } },
            },
            {
              from: { element: { type: 'providers' } },
              allow: { to: { element: { types: { anyOf: ['providers', 'feature'] } } } },
            },
            {
              from: { element: { type: 'feature' } },
              allow: {
                to: { element: { type: 'feature', captured: { featureName: '{{from.element.captured.featureName}}' } } },
              },
            },
          ],
        },
      ],
    },
  },
]);
