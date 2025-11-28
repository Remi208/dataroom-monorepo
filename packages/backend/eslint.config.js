import js from '@eslint/js'
import globals from 'globals'
import typescript from '@typescript-eslint/eslint-plugin'
import parser from '@typescript-eslint/parser'

export default [
    { ignores: ['dist', 'node_modules', 'build'] },
    {
        files: ['**/*.{js,mjs,cjs,ts}'],
        languageOptions: {
            ecmaVersion: 'latest',
            sourceType: 'module',
            parser: parser,
            globals: globals.node,
        },
        plugins: {
            '@typescript-eslint': typescript,
        },
        rules: {
            ...js.configs.recommended.rules,
            ...typescript.configs.recommended.rules,
            '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
        },
    },
]
