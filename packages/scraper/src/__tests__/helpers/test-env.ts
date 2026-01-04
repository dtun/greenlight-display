export function createTestEnv(overrides = {}) {
	return {
		API_KEY: 'test-api-key',
		GREENLIGHT_EMAIL: 'test@example.com',
		GREENLIGHT_PASSWORD: 'test-password',
		...overrides,
	}
}
