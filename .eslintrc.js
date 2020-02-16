module.exports = {
  parser: '@typescript-eslint/parser',
  env: {
    node: true,
    browser: true,
  },
  parserOptions: {
    // ecmaVersion: 6,
    // sourceType: 'module',
    tsconfigRootDir: __dirname,
    project: ['./tsconfig.json'],
    // ecmaFeatures: {
    //   jsx: true,
    // },
  },
  plugins: ['@typescript-eslint'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/eslint-recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:@typescript-eslint/recommended-requiring-type-checking',
    'prettier',
  ],
};
