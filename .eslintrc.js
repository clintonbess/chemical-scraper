module.exports = {
  'parser': 'babel-eslint',
  'extends': [
    'plugin:flowtype/recommended',
    'standard',
    'plugin:unicorn/recommended',
  ],
  'plugins': [
    'flowtype',
    'standard',
    'promise',
    'unicorn',
  ],
  'rules': {
    'arrow-parens': ['error', 'always'],
    'camelcase': 0,
    'comma-dangle': [ 'error', 'always-multiline' ],
    'flowtype/require-valid-file-annotation': [
      2,
      'always',
      { 'annotationStyle': 'line' },
    ],
    'flowtype/type-id-match': [
      2,
      // Only enforce that it starts with a capital letter
      '^[A-Z][a-z0-9]*',
    ],
    'import/extensions': [ 'error', 'always', { 'js': 'never' } ],
    'import/newline-after-import': [ 'error' ],
    'import/no-internal-modules': [ 'error', {
      'allow': [ '**/lib/*' ],
    } ],
    'import/no-namespace': 'error',
    'no-await-in-loop': [ 'error' ],
    'no-confusing-arrow': ['error', {'allowParens': true}],
    'no-console': [ 'error' ],
    'no-implicit-coercion': [ 'error' ],
    'no-unused-vars': ['error', {
      'vars': 'all',
      'args': 'all',
      'caughtErrors': 'all',
      'varsIgnorePattern': '[iI]gnored',
      'argsIgnorePattern': '[iI]gnored',
      'caughtErrorsIgnorePattern': '[iI]gnored',
      'ignoreRestSiblings': true,
    }],
    'no-var': [ 'error' ],
    'prefer-template': [ 'error' ],
    'require-await': [ 'error' ],
  },
}
