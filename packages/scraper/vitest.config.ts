import { defineWorkersConfig } from '@cloudflare/vitest-pool-workers/config'

export default defineWorkersConfig({
	test: {
		globals: true,
		poolOptions: {
			workers: {
				wrangler: { configPath: './wrangler.toml' },
				miniflare: {
					kvNamespaces: ['KV_CACHE'],
					bindings: {
						API_KEY: 'test-api-key-for-testing',
						GREENLIGHT_EMAIL: 'test@example.com',
						GREENLIGHT_PASSWORD: 'test-password',
					},
				},
			},
		},
		coverage: {
			provider: 'v8',
			reporter: ['text', 'json', 'html'],
			exclude: ['**/__tests__/**', '**/node_modules/**', '**/test/**'],
		},
	},
})
