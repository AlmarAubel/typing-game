import pluginVue from 'eslint-plugin-vue'
import vueTsEslintConfig from '@vue/eslint-config-typescript'
import skipFormatting from '@vue/eslint-config-prettier/skip-formatting'

export default [
  {
    name: 'app/files-to-lint',
    files: ['**/*.{ts,mts,tsx,vue}'],
  },
  {
    name: 'app/files-to-ignore',
    ignores: [
      '**/dist/**',
      '**/dist-ssr/**', 
      '**/coverage/**',
      '**/node_modules/**',
      '**/*.d.ts',
      // Ignore generated .js files from Vue SFCs
      '**/*.vue.js',
      // Ignore deploy script (uses CommonJS)
      'deploy.js'
    ],
  },
  ...pluginVue.configs['flat/essential'],
  ...vueTsEslintConfig(),
  {
    rules: {
      // Vue 3 specific rules
      'vue/no-multiple-template-root': 'off',
      'vue/multi-word-component-names': 'off',
      
      // Allow unused vars for Vue template variables and event handlers  
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^(_|\\$event)',
        },
      ],
      
      // Relax some strict rules
      '@typescript-eslint/no-explicit-any': 'warn',
      
      // Allow require() in .js files (like deploy.js)
      '@typescript-eslint/no-require-imports': 'off',
    },
  },
  skipFormatting,
]