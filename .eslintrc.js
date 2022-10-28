module.exports = {
   parser: '@typescript-eslint/parser',
   parserOptions: {
      project: 'tsconfig.json',
      sourceType: 'module',
      createDefaultProgram: true,
   },
   plugins: ['@typescript-eslint/eslint-plugin'],
   extends: [
      'plugin:@typescript-eslint/eslint-recommended',
      'plugin:@typescript-eslint/recommended',
      'prettier',
      'plugin:prettier/recommended',
   ],
   root: true,
   env: {
      node: true,
   },
   rules: {
      '@typescript-eslint/interface-name-prefix': 'off',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-non-null-assertion': 'off',
      'prettier/prettier': [
         'error',
         {
            endOfLine: 'auto',
         },
      ],
   },
   ignorePatterns: ['node_modules', 'built'],
};
