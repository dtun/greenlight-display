import { defineConfig } from 'vitest/config'

export default defineConfig({
	test: {
		name: 'shared',
		globals: true,
		environment: 'node',
		include: ['src/__tests__/**/*.test.ts'],
		coverage: {
			provider: 'v8',
			reporter: ['text', 'json', 'html'],
			exclude: ['**/__tests__/**', '**/node_modules/**'],
		},
	},
})
