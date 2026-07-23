import js from '@eslint/js';
import ts from 'typescript-eslint';
import svelte from 'eslint-plugin-svelte';
import prettier from 'eslint-config-prettier';
import globals from 'globals';

export default ts.config(
	js.configs.recommended,
	...ts.configs.recommended,
	...svelte.configs['flat/recommended'],
	{
		languageOptions: {
			globals: { ...globals.browser, ...globals.node }
		}
	},
	{
		files: ['**/*.svelte'],
		languageOptions: {
			parserOptions: {
				parser: ts.parser
			}
		}
	},
	{
		// Svelte 5 runes module files (.svelte.js / .svelte.ts) need an explicit
		// TypeScript parser so syntax like `import type`, generics, and enums
		// parse correctly. Without this the svelte parser falls back to espree
		// and chokes on TypeScript-only constructs.
		files: ['**/*.svelte.js', '**/*.svelte.ts'],
		languageOptions: {
			parserOptions: {
				parser: ts.parser
			}
		}
	},
	{
		ignores: [
			'.svelte-kit/',
			'node_modules/',
			'build/',
			'.wrangler/',
			'*.cjs',
			'worker-configuration.d.ts'
		]
	},
	prettier,
	{
		rules: {
			'svelte/no-navigation-without-resolve': 'off'
		}
	}
);
